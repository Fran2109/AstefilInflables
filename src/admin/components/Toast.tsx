import { useEffect, useState } from "react";
import { useAdmin } from "@/admin/store/AdminContext";

/** Toast inferior centrado que se muestra ~2.6s ante cada acción. */
export function Toast() {
  const { toast } = useAdmin();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-[99] max-w-[calc(100%-40px)] -translate-x-1/2 rounded-full border-[3px] border-papel bg-tinta px-[22px] py-3 text-center font-alt font-bold text-papel shadow-[0_6px_0_rgba(0,0,0,.25)] transition-transform duration-200 ${
        visible ? "translate-y-0" : "translate-y-[150%]"
      }`}
    >
      {toast?.msg}
    </div>
  );
}
