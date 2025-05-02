import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const TokenWarningMessage = () => (
  <span
    className={cn(
      "inline-flex items-center bg-amber-200 mt-2 text-amber-800 text-xs font-medium mr-2 px-2 py-2 rounded-sm",
      "dark:bg-amber-200 dark:text-amber-800"
    )}
  >
    <AlertTriangle className="text-amber-800 mr-1.5 my-2 mr-2" size={20} />
    Before creating the wallet, ensure that you have added tokens to the above address.
  </span>
);

export default TokenWarningMessage;
