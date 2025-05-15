// import React from "react";
// import { Pie, PieChart, ResponsiveContainer } from "recharts";

// function PieChartComponent() {
//   const data02 = [
//     {
//       name: "18-24",
//       value: 5,
//     },
//     {
//       name: "25-34",
//       value: 3,
//     },
//     {
//       name: "35-44",
//       value: 8,
//     },
//     {
//       name: "45-54",
//       value: 0,
//     },
//     {
//       name: "55-64",
//       value: 10,
//     },
//     {
//       name: "65+",
//       value: 12,
//     },
//   ];

//   return (
//     <div className="border p-5 rounded-lg">
//       <h2 className="font-bold text-lg">Age Group Distribution</h2>
//       <ResponsiveContainer width={"100%"} height={300}>
//         <PieChart width={730} height={250}>
//           <Pie
//             data={data02}
//             dataKey="value"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             innerRadius={60}
//             outerRadius={80}
//             fill="#82ca9d"
//             label
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default PieChartComponent;
import React, { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { Patient } from "@/types";

interface Props {
  patients: Patient[];
}

function PieChartComponent({ patients }: Props) {
  const data = useMemo(() => {
    const grouped = {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55-64": 0,
      "65+": 0,
    };

    patients.forEach((p) => {
      const age = Number(p.age);
      if (age < 25) grouped["18-24"]++;
      else if (age < 35) grouped["25-34"]++;
      else if (age < 45) grouped["35-44"]++;
      else if (age < 55) grouped["45-54"]++;
      else if (age < 65) grouped["55-64"]++;
      else grouped["65+"]++;
    });

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [patients]);

  return (
    <div className="border p-5 rounded-lg">
      <h2 className="font-bold text-lg">Age Group Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#82ca9d"
            label
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartComponent;
