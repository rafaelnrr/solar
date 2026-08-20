"use client";

import { useState, useCallback } from "react";

type ButtonType = "number" | "operator" | "equals" | "clear" | "special";

interface CalcButton {
  label: string;
  value: string;
  type: ButtonType;
  span?: number;
}

const buttons: CalcButton[] = [
  { label: "AC", value: "clear", type: "clear" },
  { label: "+/-", value: "toggle", type: "special" },
  { label: "%", value: "%", type: "special" },
  { label: "÷", value: "/", type: "operator" },

  { label: "7", value: "7", type: "number" },
  { label: "8", value: "8", type: "number" },
  { label: "9", value: "9", type: "number" },
  { label: "×", value: "*", type: "operator" },

  { label: "4", value: "4", type: "number" },
  { label: "5", value: "5", type: "number" },
  { label: "6", value: "6", type: "number" },
  { label: "−", value: "-", type: "operator" },

  { label: "1", value: "1", type: "number" },
  { label: "2", value: "2", type: "number" },
  { label: "3", value: "3", type: "number" },
  { label: "+", value: "+", type: "operator" },

  { label: "0", value: "0", type: "number", span: 2 },
  { label: ".", value: ".", type: "number" },
  { label: "=", value: "=", type: "equals" },
];

const buttonStyles: Record<ButtonType, string> = {
  number: "bg-[#333347] hover:bg-[#444460] text-white",
  operator: "bg-[#f59e0b] hover:bg-[#fbbf24] text-white",
  equals: "bg-[#f59e0b] hover:bg-[#fbbf24] text-white",
  clear: "bg-[#6b7280] hover:bg-[#9ca3af] text-white",
  special: "bg-[#6b7280] hover:bg-[#9ca3af] text-white",
};

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [operand, setOperand] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  const formatDisplay = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(4);
    }
    const str = num.toString();
    if (str.includes(".")) {
      const [int, dec] = str.split(".");
      return `${parseInt(int).toLocaleString("pt-BR")}.${dec.slice(0, 8)}`;
    }
    return num.toLocaleString("pt-BR");
  };

  const calculate = useCallback(
    (a: string, op: string, b: string): string => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      switch (op) {
        case "+":
          return String(numA + numB);
        case "-":
          return String(numA - numB);
        case "*":
          return String(numA * numB);
        case "/":
          if (numB === 0) return "Erro";
          return String(numA / numB);
        default:
          return b;
      }
    },
    []
  );

  const handleButton = useCallback(
    (btn: CalcButton) => {
      if (btn.value === "clear") {
        setDisplay("0");
        setExpression("");
        setOperand(null);
        setOperator(null);
        setWaitingForOperand(false);
        setJustCalculated(false);
        return;
      }

      if (btn.value === "toggle") {
        setDisplay((d) => String(parseFloat(d) * -1));
        return;
      }

      if (btn.value === "%") {
        setDisplay((d) => String(parseFloat(d) / 100));
        return;
      }

      if (btn.type === "operator") {
        if (operator && !waitingForOperand && operand !== null) {
          const result = calculate(operand, operator, display);
          setDisplay(result);
          setOperand(result);
          setExpression(`${result} ${btn.label}`);
        } else {
          setOperand(display);
          setExpression(`${display} ${btn.label}`);
        }
        setOperator(btn.value);
        setWaitingForOperand(true);
        setJustCalculated(false);
        return;
      }

      if (btn.value === "=") {
        if (operator && operand !== null) {
          const result = calculate(operand, operator, display);
          setExpression(`${operand} ${operator === "/" ? "÷" : operator === "*" ? "×" : operator === "-" ? "−" : "+"} ${display} =`);
          setDisplay(result);
          setOperand(null);
          setOperator(null);
          setWaitingForOperand(false);
          setJustCalculated(true);
        }
        return;
      }

      // number or dot
      if (waitingForOperand || justCalculated) {
        setDisplay(btn.value === "." ? "0." : btn.value);
        setWaitingForOperand(false);
        setJustCalculated(false);
        return;
      }

      if (btn.value === "." && display.includes(".")) return;

      setDisplay((d) => {
        if (d === "0" && btn.value !== ".") return btn.value;
        if (d.replace("-", "").replace(".", "").length >= 12) return d;
        return d + btn.value;
      });
    },
    [display, operand, operator, waitingForOperand, justCalculated, calculate]
  );

  const displayFontSize =
    display.length > 12
      ? "text-2xl"
      : display.length > 8
      ? "text-4xl"
      : "text-5xl";

  return (
    <div className="w-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
      {/* Display */}
      <div className="bg-[#1a1a2e]/80 backdrop-blur px-6 pt-8 pb-4 flex flex-col items-end gap-1">
        <span className="text-white/40 text-sm h-5 truncate max-w-full">
          {expression}
        </span>
        <span
          className={`text-white font-light tracking-tight transition-all duration-100 ${displayFontSize}`}
        >
          {formatDisplay(display)}
        </span>
      </div>

      {/* Buttons */}
      <div className="bg-[#1e1e35]/90 backdrop-blur p-3 grid grid-cols-4 gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleButton(btn)}
            className={`
              ${buttonStyles[btn.type]}
              ${btn.span === 2 ? "col-span-2" : ""}
              h-16 rounded-2xl text-xl font-medium
              active:scale-95 transition-all duration-75
              shadow-md shadow-black/30
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-[#1e1e35]/90 text-center pb-4">
        <span className="text-white/20 text-xs tracking-widest uppercase">
          Solar Calculator
        </span>
      </div>
    </div>
  );
}
