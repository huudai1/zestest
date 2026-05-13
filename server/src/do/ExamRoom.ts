import { Bindings } from '../types';

// ==========================================
// LỚP DURABLE OBJECT QUẢN LÝ PHÒNG THI
// ==========================================
export class ExamRoom {
    state: DurableObjectState;
    allSessions: Set<WebSocket>;
    studentMapping: Map<WebSocket, string>; // socket -> studentId
    students: Map<string, any>;

    constructor(state: DurableObjectState, env: Bindings) {
        this.state = state;
        this.allSessions = new Set();
        this.studentMapping = new Map();
        this.students = new Map();
    }

    async fetch(request: Request) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        const webSocketPair = new WebSocketPair();
        const client = webSocketPair[0];
        const server = webSocketPair[1];

        server.accept();
        this.allSessions.add(server);

        // Gửi danh sách học sinh hiện tại ngay khi kết nối
        server.send(JSON.stringify({ type: 'SYNC_STUDENTS', students: Array.from(this.students.values()) }));

        server.addEventListener('message', event => {
            try {
                const data = JSON.parse(event.data as string);
                
                if (data.type === 'STUDENT_JOIN' || data.type === 'STUDENT_UPDATE') {
                    if (data.student && data.student.id) {
                        data.student.status = 'online';
                        data.student.last_seen = Date.now();
                        this.students.set(data.student.id, data.student);
                        this.studentMapping.set(server, data.student.id);
                    }
                }

                if (data.type === 'KICK_STUDENT' && data.studentId) {
                    const targetId = data.studentId;
                    this.students.delete(targetId);
                    
                    for (const [socket, sid] of this.studentMapping.entries()) {
                        if (sid === targetId) {
                            socket.send(JSON.stringify({ type: 'YOU_ARE_KICKED' }));
                            // Không close ngay để client kịp nhận message và redirect
                            setTimeout(() => socket.close(1000, "Kicked"), 100);
                            this.studentMapping.delete(socket);
                        }
                    }
                }
                
                this.broadcast(JSON.stringify({ type: 'SYNC_STUDENTS', students: Array.from(this.students.values()) }));
            } catch (e) {
                console.error("DO Parse Error", e);
            }
        });

        const handleClose = () => {
            const studentId = this.studentMapping.get(server);
            if (studentId) {
                this.students.delete(studentId);
                this.studentMapping.delete(server);
            }
            this.allSessions.delete(server);
            this.broadcast(JSON.stringify({ type: 'SYNC_STUDENTS', students: Array.from(this.students.values()) }));
        };

        server.addEventListener('close', handleClose);
        server.addEventListener('error', handleClose);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    broadcast(msg: string) {
        for (const session of this.allSessions) {
            try {
                session.send(msg);
            } catch (e) {
                this.allSessions.delete(session);
            }
        }
    }
}
