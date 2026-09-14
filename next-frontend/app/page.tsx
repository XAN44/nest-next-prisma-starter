import { db } from "@/lib/prisma";

export default async function Home() {
  const tasks = await db.task.findMany();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>รายการ Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.done ? "เสร็จแล้ว" : "ยังไม่เสร็จ"}
          </li>
        ))}
      </ul>
    </div>
  );
}
