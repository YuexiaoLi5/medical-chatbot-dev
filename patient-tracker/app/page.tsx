"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: patients, error } = await supabase.from("patients").select("*");
      if (error) {
        console.error("Supabase error:", error);
      } else {
        setData(patients || []);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Patients from Supabase</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
