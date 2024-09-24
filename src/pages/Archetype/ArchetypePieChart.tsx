import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector
} from "recharts";
import Size from "@assets/archetypes/people.png";
import Growth from "@assets/archetypes/seed.png";
import Performance from "@assets/archetypes/growth.png";
import Reputation from "@assets/archetypes/reputation-management.png";
import Conviction from "@assets/archetypes/deal.png";
import { HubArchetype, HubArchetypeParameters } from "@aut-labs/sdk";

const nameShortcut = {
  Size: "S",
  Growth: "G",
  Performance: "P",
  Reputation: "R",
  Conviction: "C"
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];
// const MUTED_COLORS = ["#124b7e", "#12685e", "#7f6b14", "#7f4021", "#58127e"];
// const MUTED_COLORS = ["#468189", "#37509b", "#6a0dad", "#662d91", "#800020"];
const MUTED_COLORS = ["#7692FF", "#297373", "#8BB174", "#A54657", "#BEB2C8"];
const MORE_MUTED_COLORS = [
  "#5f70cc",
  "#214d4d",
  "#6d8d5b",
  "#804044",
  "#968fa3"
];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  value
}) => {
  if (value === 0) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle" // Change 'centre' to 'middle'
      dominantBaseline="middle" // Add this line
    >
      {nameShortcut[name]}
    </text>
  );
};

const archetypeLimits = {
  [HubArchetype.SIZE]: { min: 40, max: 60 },
  [HubArchetype.GROWTH]: { min: 40, max: 60 },
  [HubArchetype.PERFORMANCE]: { min: 40, max: 60 },
  [HubArchetype.REPUTATION]: { min: 40, max: 60 },
  [HubArchetype.CONVICTION]: { min: 40, max: 60 }
};

export const archetypeChartValues = (archetype: HubArchetypeParameters) => {
  const { min: sizeMin, max: sizeMax } = archetypeLimits[HubArchetype.SIZE];
  return {
    [HubArchetype.SIZE]: {
      type: HubArchetype.SIZE,
      title: "Size",
      description: "how many members",
      logo: Size,
      value: archetype?.size,
      min: sizeMin,
      max: sizeMax,
      defaults: {
        [HubArchetype.SIZE]: 60,
        [HubArchetype.GROWTH]: 10,
        [HubArchetype.PERFORMANCE]: 10,
        [HubArchetype.REPUTATION]: 10,
        [HubArchetype.CONVICTION]: 10
      }
    },
    [HubArchetype.REPUTATION]: {
      type: HubArchetype.REPUTATION,
      title: "Reputation",
      description: "avg. reputation of members",
      logo: Reputation,
      value: archetype?.reputation,
      min: sizeMin,
      max: sizeMax,
      defaults: {
        [HubArchetype.SIZE]: 10,
        [HubArchetype.GROWTH]: 10,
        [HubArchetype.PERFORMANCE]: 10,
        [HubArchetype.REPUTATION]: 60,
        [HubArchetype.CONVICTION]: 10
      }
    },
    [HubArchetype.CONVICTION]: {
      type: HubArchetype.CONVICTION,
      title: "Conviction",
      description: "avg. commitment level of members",
      logo: Conviction,
      value: archetype?.conviction,
      min: sizeMin,
      max: sizeMax,
      defaults: {
        [HubArchetype.SIZE]: 10,
        [HubArchetype.GROWTH]: 10,
        [HubArchetype.PERFORMANCE]: 10,
        [HubArchetype.REPUTATION]: 10,
        [HubArchetype.CONVICTION]: 60
      }
    },
    [HubArchetype.PERFORMANCE]: {
      type: HubArchetype.PERFORMANCE,
      title: "Performance",
      description: "ratio between Created Points and Completed Points",
      logo: Performance,
      value: archetype?.performance,
      min: sizeMin,
      max: sizeMax,
      defaults: {
        [HubArchetype.SIZE]: 10,
        [HubArchetype.GROWTH]: 10,
        [HubArchetype.PERFORMANCE]: 60,
        [HubArchetype.REPUTATION]: 10,
        [HubArchetype.CONVICTION]: 10
      }
    },
    [HubArchetype.GROWTH]: {
      type: HubArchetype.GROWTH,
      title: "Growth",
      description: "% of member’s growth respect to previous period",
      logo: Growth,
      value: archetype?.growth,
      min: sizeMin,
      max: sizeMax,
      defaults: {
        [HubArchetype.SIZE]: 10,
        [HubArchetype.GROWTH]: 60,
        [HubArchetype.PERFORMANCE]: 10,
        [HubArchetype.REPUTATION]: 10,
        [HubArchetype.CONVICTION]: 10
      }
    }
  };
};

const ArchetypePieChart = ({
  archetype
}: {
  archetype: HubArchetypeParameters;
}) => {
  const mappedData = useMemo(() => {
    const data = archetypeChartValues(archetype);
    return Object.keys(data || {}).reduce((prev, curr) => {
      prev = [
        ...prev,
        {
          ...data[curr],
          name: data[curr].title
        }
      ];
      return prev;
    }, []);
  }, [archetype]);

  console.log(mappedData);

  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_data, index) => {
    setActiveIndex(index);
  };

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={mappedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100} // Increased the chart size
          fill="#8884d8"
          onMouseEnter={onPieEnter}
          dataKey="value"
        >
          {mappedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ArchetypePieChartDesign = ({
  archetype
}: {
  archetype: HubArchetypeParameters;
}) => {
  const mappedData = useMemo(() => {
    const data = archetypeChartValues(archetype);
    return Object.keys(data || {}).reduce((prev, curr) => {
      prev = [
        ...prev,
        {
          ...data[curr],
          name: data[curr].title
        }
      ];
      return prev;
    }, []);
  }, [archetype]);

  console.log(mappedData);

  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_data, index) => {
    setActiveIndex(index);
  };

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={mappedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={200} // Increased the chart size
          fill="#8884d8"
          onMouseEnter={onPieEnter}
          dataKey="value"
        >
          {mappedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={MORE_MUTED_COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        outerRadius={outerRadius + 6}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`Value ${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

export default ArchetypePieChart;
