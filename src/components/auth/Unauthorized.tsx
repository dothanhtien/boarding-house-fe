import Image from "next/image";
import Link from "next/link";
import GridShape from "@/components/common/GridShape";
import { ROUTES } from "@/config/routeDefinition";
import { useTheme } from "@/context/ThemeContext";

export const Unauthorized: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="relative z-1 flex flex-1 flex-col items-center overflow-hidden p-6">
      <GridShape />
      <div className="m-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <Image
          src={
            theme === "dark"
              ? "/images/error/403-dark.svg"
              : "/images/error/403.svg"
          }
          alt="403"
          width={472}
          height={152}
        />

        <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          You don&apos;t have permission to access this page.
        </p>

        <Link
          href={ROUTES.dashboard}
          className="shadow-theme-xs inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Back to Home Page
        </Link>
      </div>

      <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - {process.env.NEXT_PUBLIC_APP_NAME}
      </p>
    </div>
  );
};
