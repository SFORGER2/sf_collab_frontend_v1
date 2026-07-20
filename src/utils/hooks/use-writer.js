"use client";;
import { useEffect, useRef, useState } from "react";

export function useWriter(text, options = {}) {
    const { speed = 10, reverseSpeed = 20, mode = "character", skipEmptyIntermediate = false, onDone } = options;

    const [displayText, setDisplayText] = useState("");
    const timerRef = useRef(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const getUnits = (str) => (mode === "word" ? str.split(" ") : str.split(""));

        const currentUnits = getUnits(displayText);
        const targetUnits = getUnits(text);

        let commonLength = 0;
        for (let i = 0; i < Math.min(currentUnits.length, targetUnits.length); i++) {
            if (currentUnits[i] === targetUnits[i]) {
                commonLength++;
            } else {
                break;
            }
        }

        const removeStep = () => {
            if (!isMounted) return;

            if (currentUnits.length > commonLength) {
                currentUnits.pop();

                if (skipEmptyIntermediate && currentUnits.length === 0) {
                    typeStep();
                    return;
                }

                setDisplayText(mode === "word" ? currentUnits.join(" ") : currentUnits.join(""));

                timerRef.current = setTimeout(removeStep, 1000 / reverseSpeed);
            } else {
                typeStep();
            }
        };

        const typeStep = () => {
            if (!isMounted) return;

            if (currentUnits.length < targetUnits.length) {
                currentUnits.push(targetUnits[currentUnits.length]);
                setDisplayText(mode === "word" ? currentUnits.join(" ") : currentUnits.join(""));
                timerRef.current = setTimeout(typeStep, 1000 / speed);
            } else {
                onDone?.();
            }
        };

        clearTimer();
        removeStep();

        return () => {
            isMounted = false;
            clearTimer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, speed, reverseSpeed, mode, skipEmptyIntermediate]);

    return displayText;
}
