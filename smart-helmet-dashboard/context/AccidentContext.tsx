"use client";

import { createContext, useContext, useState } from "react";

interface AccidentContextType {
    isAccidentActive: boolean;
    accidentSeverity: "high" | "low" | null;
    triggerAccident: () => void;
    clearAccident: () => void;
    setAccidentSeverity: (severity: "high" | "low") => void;
}

const AccidentContext = createContext<AccidentContextType | undefined>(undefined);

export function AccidentProvider({ children }: { children: React.ReactNode }) {
    const [isAccidentActive, setIsAccidentActive] = useState(false);
    const [accidentSeverity, setAccidentSeverityState] = useState<"high" | "low" | null>(null);

    const triggerAccident = () => {
        setIsAccidentActive(true);
    };

    const clearAccident = () => {
        setIsAccidentActive(false);
        setAccidentSeverityState(null);
    };

    const setAccidentSeverity = (severity: "high" | "low") => {
        setAccidentSeverityState(severity);
    };

    return (
        <AccidentContext.Provider value={{ isAccidentActive, accidentSeverity, triggerAccident, clearAccident, setAccidentSeverity }}>
            {children}
        </AccidentContext.Provider>
    );
}

export function useAccident() {
    const context = useContext(AccidentContext);
    if (context === undefined) {
        throw new Error("useAccident must be used within an AccidentProvider");
    }
    return context;
}
