// import React from "react";
// import Card from "./Card";
// import { TrendingDown, TrendingUp, UserRound, LucideIcon } from "lucide-react";

// const StatusList: React.FC = () => {
//   const totalPatient = 20;
//   const percentage = 70;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
//       <Card
//         icon={<UserRound />}
//         title="Total No. of Patients"
//         value={totalPatient}
//       />
//       <Card
//         icon={<TrendingUp />}
//         title="Total % of patients achieved targets"
//         value={percentage + "%"}
//       />
//       <Card
//         icon={<TrendingDown />}
//         title="Total % of Persuasion Success by Chatbot "
//         value={5 + "%"}
//       />
//     </div>
//   );
// };

// export default StatusList;
import React from "react";
import Card from "./Card";
import { TrendingDown, TrendingUp, UserRound } from "lucide-react";
import { Patient } from "@/types"; // ✅ 引入类型

const StatusList: React.FC<{ patients: any[] }> = ({ patients }) => {
  const totalPatient = patients.length;

  const achieved = patients.filter(
    (p) => parseInt(p.target_duration_week) >= 3 // 示例逻辑
  ).length;

  const achievedPercent = totalPatient > 0 ? Math.round((achieved / totalPatient) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
      <Card icon={<UserRound />} title="Total Patients" value={totalPatient} />
      <Card icon={<TrendingUp />} title="Achieved Targets" value={`${achievedPercent}%`} />
      <Card icon={<TrendingDown />} title="Persuasion Success" value={"N/A"} />
    </div>
  );
};

export default StatusList;
