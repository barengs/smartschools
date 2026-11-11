# Smart School Inter-Service Contracts

Folder ini menyimpan kontrak komunikasi resmi lintas layanan (**Node.js**, **Rust**, **Python**):

1. **Redis Streams Event Bus (`stream:events`)**: [events.schema.json](events.schema.json)
   - `AttendanceRecorded` (`rust-engine` → `node-erp`)
   - `WalletDeducted` (`rust-engine` → `node-erp`)
   - `CbtExamSubmitted` (`rust-engine` → `node-erp`)
   - `ScheduleGenerated` (`python-ai` → `node-erp` & `rust-engine`)
   - `EwsAlertRaised` (`python-ai` → `node-erp`)
   - `PpdbRegistered`, `StudentMigrated`, `InvoicePaid` (`node-erp`)
2. **MQTT Topics (EMQX)**:
   - `school/{school_id}/gate/{device_id}/attendance` (QoS 1)
   - `school/{school_id}/gate/{device_id}/ack` (QoS 0)
   - `school/{school_id}/bell/{device_id}/schedule` (QoS 1, Retained)
   - `school/{school_id}/device/{device_id}/heartbeat` (QoS 0)

