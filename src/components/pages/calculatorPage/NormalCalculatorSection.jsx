import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { create, all } from "mathjs";

// ---- mathjs setup ----
const math = create(all, {
  number: "number",
  precision: 64,
});
const parser = math.parser();

// ---- UI config ----
const normalButtons = [
  ["AC", "DEL", "%", "/"],
  ["7", "8", "9", "*"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

const scientificButtons = [
  ["AC", "DEL", "%", "/"],
  ["sin", "cos", "tan", "*"],
  ["(", ")", "^", "-"],
  ["log", "log2", "e", "+"],
  ["7", "8", "9", "√"],
  ["4", "5", "6", "π"],
  ["1", "2", "3", "!"],
  ["0", ".", "="],
];

// ---- helpers ----
const closeMissingParens = (expr) => {
  const open = (expr.match(/\(/g) || []).length;
  const close = (expr.match(/\)/g) || []).length;
  return expr + ")".repeat(Math.max(0, open - close));
};

export default function NormalCalculator() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState("");
  const [isScientific, setIsScientific] = useState(false);
  const lastWasEquals = useRef(false);

  const append = (value) => {
    setDisplay((prev) => {
      if (prev === "0" || lastWasEquals.current) {
        lastWasEquals.current = false;
        return value;
      }
      return prev + value;
    });
  };

  const clearAll = () => {
    parser.clear();
    setDisplay("0");
    setHistory("");
    lastWasEquals.current = false;
  };

  const del = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const evaluate = () => {
    try {
      let expression = closeMissingParens(display)
        .replace(/%/g, "*0.01")
        .replace(/π/g, "pi")
        .replace(/√/g, "sqrt");

      const result = parser.evaluate(expression);
      setHistory(display);
      setDisplay(String(result));
      lastWasEquals.current = true;
    } catch {
      setDisplay("Error");
      lastWasEquals.current = true;
    }
  };

  const handleClick = (value) => {
    if (value === "AC") return clearAll();
    if (value === "DEL") return del();
    if (value === "=") return evaluate();

    // ---- auto-parentheses & constants ----
    if (["sin", "cos", "tan", "log", "log2", "ln"].includes(value)) {
      return append(`${value}(`);
    }

    if (value === "√") return append("sqrt(");
    if (value === "π") return append("pi");
    if (value === "e") return append("e");
    if (value === "!") return append("!");

    append(value);
  };

  // ---- keyboard support ----
  const handleKeyDown = (e) => {
    const key = e.key;

    if (/[\d+\-*/.%()^]/.test(key)) {
      e.preventDefault();
      handleClick(key);
    }

    if (key === "Enter") {
      e.preventDefault();
      handleClick("=");
    }

    if (key === "Backspace") {
      e.preventDefault();
      handleClick("DEL");
    }

    if (key === "Escape") {
      e.preventDefault();
      handleClick("AC");
    }
  };

  const buttons = isScientific ? scientificButtons : normalButtons;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none"
    >
      <Card className="bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] border-[var(--border)] max-w-sm mx-auto shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[var(--color-star)] text-2xl font-bold flex-1 text-center">
              SF Calculator
            </CardTitle>
            <Button
              onClick={() => setIsScientific(!isScientific)}
              className="bg-[var(--color-violet)] hover:bg-[var(--color-violet)]/85 text-sm text-white"
            >
              {isScientific ? "Normal" : "Scientific"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* History */}
          <div className="text-right text-sm text-[var(--color-dim)] font-mono min-h-[20px] px-2">
            {history}
          </div>

          {/* Display */}
          <div className="bg-[var(--color-void)] text-right text-4xl font-mono p-6 rounded-xl text-[var(--color-star)] overflow-x-auto border border-[var(--border)] shadow-inner">
            {display}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {buttons.flat().map((btn) => (
              <Button
                key={btn}
                onClick={() => handleClick(btn)}
                className={`h-12 text-sm font-semibold
                  ${btn === "=" ? "bg-blue-600 hover:bg-blue-700 col-span-2 text-white" : ""}
                  ${["+", "-", "*", "/", "%", "^"].includes(btn)
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : ""}
                  ${["sin", "cos", "tan", "log", "ln", "e", "√", "π", "!"].includes(btn)
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""}
                  ${btn === "AC" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  ${!["=", "+", "-", "*", "/", "%", "^", "AC", "sin", "cos", "tan", "log", "ln", "e", "√", "π", "!"].includes(btn)
                    ? "bg-[color-mix(in_srgb,var(--color-star)_10%,var(--color-panel))] hover:bg-[color-mix(in_srgb,var(--color-star)_20%,var(--color-panel))] text-[var(--color-star)]"
                    : ""}
                `}
              >
                {btn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
