import { redirect } from "next/navigation";

export default function Home() {
  redirect("/outreach");

  return (
    <main className="pt-20">
      <div className="flex justify-center items-center h-screen">
        <div>Heyy guys</div>
      </div>
      <div className="h-screen flex justify-center items-center">
        <div>Scroll to test navbar behavior</div>
      </div>
      <div className="h-screen flex justify-center items-center">
        <div>Move cursor to top to show navbar</div>
      </div>
    </main>
  );
}
