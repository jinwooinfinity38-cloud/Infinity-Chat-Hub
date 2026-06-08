import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { MoreVertical, Undo2, EyeOff, AlertCircle, Trash2 } from "lucide-react"
import { ReactNode } from "react"

interface MessageActionsProps {
  children?: ReactNode;
  onQuote?: () => void;
  onHide?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
  isStaff?: boolean;
}

export function MessageActions({ children, onQuote, onHide, onReport, onDelete, isStaff }: MessageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        {children || (
          <div className="h-4 w-4 text-zinc-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center">
            <MoreVertical className="w-4 h-4" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[200px] bg-zinc-900/90 border-none text-white rounded-2xl p-2 shadow-2xl backdrop-blur-xl space-y-1"
      >
        <DropdownMenuItem 
          className="flex flex-col items-start gap-0 py-2.5 px-3 rounded-xl focus:bg-white/10 cursor-pointer"
          onClick={onQuote}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <Undo2 className="w-5 h-5 text-zinc-400 rotate-180" />
            <span className="font-bold text-[15px]">Quote</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium ml-7 leading-tight">Reply to this post</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex flex-col items-start gap-0 py-2.5 px-3 rounded-xl focus:bg-white/10 cursor-pointer"
          onClick={onHide}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <EyeOff className="w-5 h-5 text-zinc-400" />
            <span className="font-bold text-[15px]">Hide</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium ml-7 leading-tight">Hide from my screen</span>
        </DropdownMenuItem>

        {isStaff ? (
          <DropdownMenuItem 
            className="flex flex-col items-start gap-0 py-2.5 px-3 rounded-xl focus:bg-red-500/10 cursor-pointer group"
            onClick={onDelete}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <Trash2 className="w-5 h-5 text-red-500/70 group-hover:text-red-500 transition-colors" />
              <span className="font-bold text-[15px] text-red-500">Delete</span>
            </div>
            <span className="text-[11px] text-red-500/50 font-medium ml-7 leading-tight text-left">Remove this message</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            className="flex flex-col items-start gap-0 py-2.5 px-3 rounded-xl focus:bg-white/10 cursor-pointer"
            onClick={onReport}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <AlertCircle className="w-5 h-5 text-zinc-400" />
              <span className="font-bold text-[15px]">Report</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium ml-7 leading-tight text-left">Report this content</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
