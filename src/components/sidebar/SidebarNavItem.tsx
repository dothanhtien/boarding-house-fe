import Link from "next/link";
import { type NavItem } from "@/components/sidebar/navigation";
import { ChevronDownIcon } from "@/icons/index";

interface SidebarNavItemProps {
  nav: NavItem;
  index: number;
  menuType: "main" | "others";
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  isSubmenuOpen: boolean;
  subMenuHeight: number;
  isActive: (path: string) => boolean;
  onSubmenuToggle: (index: number, menuType: "main" | "others") => void;
  setSubMenuRef: (el: HTMLDivElement | null) => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  nav,
  index,
  menuType,
  isExpanded,
  isHovered,
  isMobileOpen,
  isSubmenuOpen,
  subMenuHeight,
  isActive,
  onSubmenuToggle,
  setSubMenuRef,
}) => {
  const showText = isExpanded || isHovered || isMobileOpen;

  return (
    <li>
      {nav.subItems ? (
        <button
          onClick={() => onSubmenuToggle(index, menuType)}
          className={`menu-item group ${
            isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
          } cursor-pointer ${
            !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
          }`}
        >
          <span
            className={` ${
              isSubmenuOpen
                ? "menu-item-icon-active"
                : "menu-item-icon-inactive"
            }`}
          >
            <nav.icon />
          </span>
          {showText && <span className={`menu-item-text`}>{nav.name}</span>}
          {showText && (
            <ChevronDownIcon
              className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                isSubmenuOpen ? "text-brand-500 rotate-180" : ""
              }`}
            />
          )}
        </button>
      ) : (
        nav.path && (
          <Link
            href={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`${
                isActive(nav.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              <nav.icon />
            </span>
            {showText && <span className={`menu-item-text`}>{nav.name}</span>}
          </Link>
        )
      )}
      {nav.subItems && showText && (
        <div
          ref={setSubMenuRef}
          className="overflow-hidden transition-all duration-300"
          style={{
            height: isSubmenuOpen ? `${subMenuHeight}px` : "0px",
          }}
        >
          <ul className="mt-2 ml-9 space-y-1">
            {nav.subItems.map((subItem) => (
              <li key={subItem.name}>
                <Link
                  href={subItem.path}
                  className={`menu-dropdown-item ${
                    isActive(subItem.path)
                      ? "menu-dropdown-item-active"
                      : "menu-dropdown-item-inactive"
                  }`}
                >
                  {subItem.name}
                  <span className="ml-auto flex items-center gap-1">
                    {subItem.new && (
                      <span
                        className={`ml-auto ${
                          isActive(subItem.path)
                            ? "menu-dropdown-badge-active"
                            : "menu-dropdown-badge-inactive"
                        } menu-dropdown-badge`}
                      >
                        new
                      </span>
                    )}
                    {subItem.pro && (
                      <span
                        className={`ml-auto ${
                          isActive(subItem.path)
                            ? "menu-dropdown-badge-active"
                            : "menu-dropdown-badge-inactive"
                        } menu-dropdown-badge`}
                      >
                        pro
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};
