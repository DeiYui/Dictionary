import { colors } from "@/assets/colors";
import { Logo } from "@/assets/icons";
import { navigation } from "@/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { VerticalNavItem } from "@/interface/Navigation";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();

  const sidebar = useRef(null);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const storedSidebarExpanded = localStorage.getItem("sidebarExpanded");
    if (storedSidebarExpanded !== null) {
      setSidebarExpanded(storedSidebarExpanded === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded((prevExpanded) => !prevExpanded);
    localStorage.setItem("sidebarExpanded", `${!sidebarExpanded}`);
  };

  // Render sideBar có children
  const renderParentItem = (item: VerticalNavItem) => (
    <SidebarLinkGroup activeCondition={pathname.includes(item.path)}>
      {(handleClick, open) => (
        <React.Fragment key={item.path}>
          <Link
            href={item.path}
            className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 text-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
              pathname.includes(item.path) && "bg-graydark dark:bg-meta-4"
            }`}
            onClick={(e) => {
              e.preventDefault();
              sidebarExpanded ? handleClick() : toggleSidebar();
            }}
          >
            {item.icon}
            {item.label}
            <svg
              className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                open && "rotate-180"
              }`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                fill=""
              />
            </svg>
          </Link>
          {/* <!-- Dropdown Menu Start --> */}
          <div
            className={`translate transform overflow-hidden ${
              !open && "hidden"
            }`}
          >
            <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
              {item.children?.map((e) => (
                <li key={e.key}>
                  <Link
                    href={e.path}
                    className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                      pathname === e.path && "text-white"
                    }`}
                  >
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- Dropdown Menu End --> */}
        </React.Fragment>
      )}
    </SidebarLinkGroup>
  );

  // Render sideBar không có children
  const renderItem = (item: VerticalNavItem) => (
    <li>
      <Link
        href={item.path}
        className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
          pathname.includes(item.path) && "bg-graydark dark:bg-meta-4"
        }`}
      >
        {item.icon}
        {item.label}
      </Link>
    </li>
  );

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-70 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-center gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/" className="flex items-end justify-center">
          <Logo size={80} color={colors.primary400} />
          <div className="mb-1 text-3xl font-bold text-white">eSign</div>
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 pl-4 pr-2 lg:mt-9 ">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            {/* Menu */}
            <ul className="mb-6 flex flex-col gap-1.5">
              {navigation?.map((item) => (
                <React.Fragment key={item.label}>
                  {item.children?.length
                    ? renderParentItem(item)
                    : renderItem(item)}
                </React.Fragment>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;