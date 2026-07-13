import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppUrl } from "@/lib/site";

export function MobileContact() {
  return <a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="fixed inset-x-4 bottom-4 z-40 flex min-h-13 items-center justify-center gap-2 rounded-full bg-mint px-5 font-extrabold text-ink shadow-2xl md:hidden"><FaWhatsapp size={20} /> Conversar sobre um projeto</a>;
}
