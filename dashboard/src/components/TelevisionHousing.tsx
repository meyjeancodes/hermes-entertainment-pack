import React from "react";

interface TelevisionHousingProps {
  powerOn: boolean;
  children: React.ReactNode;
}

const TelevisionHousing: React.FC<TelevisionHousingProps> = ({ powerOn, children }) => {
  return (
    <div
      className="relative rounded-[28px]"
      style={{
        background: "rgba(10, 10, 24, 0.55)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)",
        padding: "14px 14px 20px",
      }}
    >
      <div
        className="absolute top-0 left-8 right-8 h-px rounded-full"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",
        }}
      />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            powerOn
              ? "bg-emerald-400 shadow-[0_0_10px_#4ade80]"
              : "bg-red-600 shadow-[0_0_6px_#dc2626]"
          }`}
        />
        <span
          className="text-[0.6rem] font-mono tracking-[0.5em] uppercase font-bold"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          NOUS
        </span>
      </div>

      <div
        className="relative rounded-[16px] mt-3 shadow-[inset_0_4px_20px_rgba(0,0,0,0.95),inset_0_0_0_2px_rgba(0,0,0,0.8)]"
        style={{ background: "#080604", padding: "20px" }}
      >
        <div
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          style={{
            boxShadow: powerOn
              ? "inset 0 0 40px rgba(74,222,128,0.06)"
              : "none",
          }}
        />

        {children}
      </div>
    </div>
  );
};

export default TelevisionHousing;
