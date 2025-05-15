// "use client";
// import { useTheme } from "next-themes";
// import React, { useEffect } from "react";
// import { DatePicker } from "../_components/DatePicker";
// import StatusList from "./_components/StatusList";
// import BarChartComponent from "./_components/BarChartComponent";
// import PieChartComponent from "./_components/PieChartComponent";

// function Dashboard() {
//   const { setTheme } = useTheme();
//   useEffect(() => {
//     setTheme("system");
//   });
//   return (
//     <div className="p-10">
//       <div className="flex items-center justify-between">
//         <h2 className="font-bold text-2xl">Dashboard</h2>
//         <div className="flex items-center gap-4">
//           <DatePicker />
//         </div>
//       </div>
//       <StatusList />
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//         <div className="md:col-span-2">
//           <BarChartComponent />
//         </div>
//         <div>
//           <PieChartComponent />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
// "use client";
// import { useTheme } from "next-themes";
// import React, { useEffect, useState } from "react";
// import { DatePicker } from "../_components/DatePicker";
// import StatusList from "./_components/StatusList";
// import BarChartComponent from "./_components/BarChartComponent";
// import PieChartComponent from "./_components/PieChartComponent";
// import { createClient } from "@/utils/supabase/client";
// import { Patient } from "@/types";  // ✅ 引入类型

// const supabase = createClient();

// function Dashboard() {
//   const { setTheme } = useTheme();
//   const [patients, setPatients] = useState<Patient[]>([]); // ✅ 明确 useState 类型

//   useEffect(() => {
//     setTheme("system");

//     const fetchPatients = async () => {
//       const { data, error } = await supabase.from("patients").select("*");
//       if (error) {
//         console.error("Failed to fetch patients:", error.message);
//       } else {
//         setPatients(data || []);
//       }
//     };

//     fetchPatients();
//   }, []);

//   return (
//     <div className="p-10">
//       <div className="flex items-center justify-between">
//         <h2 className="font-bold text-2xl">Dashboard</h2>
//         <div className="flex items-center gap-4">
//           <DatePicker />
//         </div>
//       </div>
//       <StatusList patients={patients} />
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//         <div className="md:col-span-2">
//           <BarChartComponent patients={patients} />
//         </div>
//         <div>
//           <PieChartComponent patients={patients} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "next-themes";
import { Patient } from "@/types";

import { DatePicker } from "../_components/DatePicker";
import StatusList from "./_components/StatusList";
import BarChartComponent from "./_components/BarChartComponent";
import PieChartComponent from "./_components/PieChartComponent";

const supabase = createClient();

function Dashboard() {
  const { setTheme } = useTheme();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);

  useEffect(() => {
    setTheme("system");

    const fetchPatients = async () => {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) {
        console.error("Error fetching patients:", error.message);
      } else {
        setPatients(data || []);
      }
    };

    fetchPatients();
  }, []);

  // 🎯 筛选最近 7 天病人（或者你也可以手动设置 startDate）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const filteredPatients = patients.filter((p) => {
    const created = new Date(p.created_at);
    return created >= (startDate || sevenDaysAgo); // 用 DatePicker 或默认 7 天
  });

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Dashboard</h2>
        {/* 可选：支持用户手动修改筛选时间 */}
        <DatePicker onChange={(date) => setStartDate(date)} />
      </div>

      <StatusList patients={filteredPatients} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className="md:col-span-2">
          <BarChartComponent patients={filteredPatients} />
        </div>
        <div>
          <PieChartComponent patients={filteredPatients} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
