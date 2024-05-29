import { AdminIcon } from "@/assets/icons/AdminIcon";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const AdminSystem = () => {
  const admin = useSelector((state: RootState) => state.admin);

  return [
    {
      key: "/learning-management",
      label: "Quản lý học tập",
      path: "/learning-management",
      icon: <AdminIcon color="white" size={20} />,
      children: [
        {
          key: "/learning-management/topics",
          label: "Chủ đề",
          path: "/learning-management/topics",
          hidden: false,
        },
        {
          key: "/learning-management/vocabulary",
          label: "Ký hiệu",
          path: "/learning-management/vocabulary",
          hidden: false,
        },
        {
          key: "/learning-management/check-list",
          label: "Bài kiểm tra",
          path: "/learning-management/check-list",
          hidden: false,
        },
      ],
      hidden: false,
    },
  ].filter((item) => !item.hidden);
};