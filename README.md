# การติดตั้ง Devote

ทําตามขั้นตอนด้านล่างนี้เพื่อติดตั้งและรัน Devote บนระบบ:

## ขั้นตอนการติดตั้ง

### การติดตั้งโปรแกรมพื้นฐาน:

1. ติดตั้ง Node.js
2. ติดตั้ง Docker
3. ติดตั้ง Visual Studio Code (Vscode)

### เตรียมโปรเจค:

- เปิด Vscode และเปิดโฟลเดอร์ของโปรเจค (Project Folder)
- เปิด Command Line Interface (CLI) หรือ Terminal ภายใน Vscode

### สร้าง Docker Image สำหรับ Backend:
- ใน CLI พิมพ์ `cd backend/truffle`
- ต่อด้วยคำสั่ง `npm install -g truffle`
- ต่อด้วยคำสั่ง `truffle build`
- ต่อด้วยคำสั่ง `cd ..`
- ต่อด้วยคำสั่ง `docker build -t devote_backend .`

### สร้าง Docker Image สำหรับ Private Blockchain:

- เปิด CLI ใหม่และพิมพ์ `cd Devote_Private_Blockchain`
- ต่อด้วยคำสั่ง `docker build -t ethereum-geth-arm .`

### สร้าง Docker Image สำหรับ Frontend:

- เปิด CLI ใหม่อีกครั้ง และพิมพ์ `cd frontend`
- ต่อด้วยคำสั่ง `docker build -t devote_frontend .`

### รัน Docker Compose:

- เมื่อขั้นตอนที่ 3, 4 และ 5 เสร็จสิ้น, เปิด CLI ใหม่และพิมพ์ `docker compose up -d`
- รอจนทุก Container เริ่มทำงาน

### Deploy Contract ด้วย Truffle:

- เปิด CLI ใหม่และพิมพ์ `cd backend/truffle`
- ต่อด้วยคำสั่ง `truffle migrate --reset`

### เข้าถึงแอปพลิเคชัน:

- เมื่อการ migrate เสร็จสิ้น, เข้าหน้าเว็บได้ที่: [http://localhost:3000](http://localhost:3000)

### การปิดการทำงาน

- หากต้องการปิดการทำงานของ Devote, ใช้คำสั่ง `docker compose stop` ใน CLI.

### การตรวจสอบ Transaction

- เปิด CLI ใหม่และพิมพ์ `docker ps -a`
- คัดลอก CONTAINER ID ของ node1 หรือ node2
- พิมพ์ `docker exec -it <CONTAINER ID> geth attach http://localhost:8545/` ตรง `<CONTAINER ID>` ใส่สิ่งที่คัดลอกมา
- หลังจากเข้ามาใน geth พิมพ์ `eth.getTransaction("ใส่ Transaction hash")`


