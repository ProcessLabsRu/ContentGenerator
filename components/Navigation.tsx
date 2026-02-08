"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, useI18n } from "@/lib/i18n";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { LLMConnectionIndicator } from "./LLMConnectionIndicator";
import { UserMenu } from "./auth/UserMenu";
import { CalendarDays, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const USFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" className={className}>
    <path fill="#bd3d44" d="M0 0h640v480H0z" />
    <path fill="#fff" d="M0 36.9h640v37H0zm0 73.8h640v37H0zm0 74h640v36.8H0zm0 73.8h640v37H0zm0 73.9h640v36.9H0zm0 73.8h640v37H0z" />
    <path fill="#192f5d" d="M0 0h256v258.5H0z" />
  </svg>
);

const BRFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" className={className}>
    <g fillRule="evenodd">
      <path fill="#009c3b" d="M0 0h640v480H0z" />
      <path fill="#ffdf00" d="M320 54.9L585.1 240 320 425.1 54.9 240z" />
      <circle fill="#002776" cx="320" cy="240" r="109.7" />
      <path fill="#fff" d="M171.2 240a153.2 153.2 0 01297.6 0 153.2 153.2 0 00-297.6 0z" />
    </g>
  </svg>
);

export const Navigation: React.FC = () => {
  return (
    <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
      <NavigationContent />
    </Suspense>
  );
};

const NavigationContent: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();

  const view = searchParams.get('view') || 'generations';

  const setView = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`?${params.toString()}`);
  };

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-auto flex items-center">
                <img src="/logo.svg" alt="Logo" className="h-8 w-auto transition-transform group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold text-brand-dark group-hover:text-brand-red transition-colors leading-none tracking-tight">
                  {t("medical.app.title")}
                </span>
                <span className="text-[10px] text-gray-500 font-medium mt-0.5 leading-none">
                  {t("medical.app.subtitle")}
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center bg-gray-100 p-1 rounded-lg gap-1">
            <button
              onClick={() => setView('generations')}
              title={t("sidebar.generations")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'generations'
                ? "bg-white text-brand-red shadow-sm"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-200"
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden xl:inline">{t("sidebar.generations")}</span>
            </button>
            <button
              onClick={() => setView('calendar')}
              title={t("health.calendar.title")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'calendar'
                ? "bg-white text-brand-red shadow-sm"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-200"
                }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden xl:inline">{t("health.calendar.title")}</span>
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-4">
                <ConnectionIndicator />
                <LLMConnectionIndicator />
              </div>
              <div className="flex items-center gap-3 ml-2 border-l border-gray-100 pl-4">
                <button
                  onClick={() => setLocale('en')}
                  className={`group relative flex items-center transition-all ${locale === 'en' ? 'scale-110' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                  title={t("nav.language.en")}
                >
                  <USFlag className={`w-6 h-auto rounded-sm shadow-sm transition-all ${locale === 'en' ? 'ring-2 ring-brand-red ring-offset-1' : ''}`} />
                  {locale === 'en' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-red rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setLocale('pt-BR')}
                  className={`group relative flex items-center transition-all ${locale === 'pt-BR' ? 'scale-110' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                  title={t("nav.language.ptBr")}
                >
                  <BRFlag className={`w-6 h-auto rounded-sm shadow-sm transition-all ${locale === 'pt-BR' ? 'ring-2 ring-brand-red ring-offset-1' : ''}`} />
                  {locale === 'pt-BR' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-red rounded-full" />
                  )}
                </button>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
