"use client";;
import { useEffect, useRef } from "react";

import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export const ResponseWriter = ({
    text,
    ...props
}) => {
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
            if (viewport) {
                viewport.scrollTo({
                    top: viewport.scrollHeight,
                    behavior: "smooth",
                });
            }
        }
    }, [text]);

    return (
        <ScrollArea ref={scrollAreaRef} {...props}>
            <div className="pr-4">
                <p className=" text-sm whitespace-pre-line">{text}</p>
            </div>
            <ScrollBar orientation="vertical" />
        </ScrollArea>
    );
};
