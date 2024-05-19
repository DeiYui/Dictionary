/* eslint-disable @next/next/no-img-element */
import { isImage } from "@/components/common/constants";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Modal, Spin } from "antd";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useEffect, useRef, useState } from "react";

export default function ContentMessage({
  messages,
  user,
  isFetching,
  isTyping,
  userInfo,
}: ContentMessageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [itemPreview, setItemPreview] = useState<string | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [isTyping]);

  const renderMess = messages.map((mes, index) => (
    <div
      className={`flex gap-3 ${
        mes.contactId === user?.userId ? "justify-end" : ""
      }`}
      key={index}
    >
      {mes.contactId === user?.userId ? (
        <div className="flex flex-col items-end">
          <div className="w-fit flex-grow rounded-xl bg-[#F0F0F0] px-3 py-2 text-sm">
            {mes.content}
          </div>
          <div className="">
            {mes.mediaLocation && (
              <div className="pt-1">
                {isImage(mes.mediaLocation) ? (
                  <img
                    className="h-auto  w-36 hover:cursor-pointer "
                    style={{ borderRadius: "12px" }}
                    src={mes.mediaLocation}
                    alt="Preview"
                    onClick={() => {
                      setOpenPreview(true);
                      setItemPreview(mes.mediaLocation);
                    }}
                  />
                ) : (
                  <video
                    className="w-36 hover:cursor-pointer"
                    onClick={() => {
                      setOpenPreview(true);
                      setItemPreview(mes.mediaLocation);
                    }}
                    style={{ borderRadius: "12px" }}
                  >
                    <source src={mes.mediaLocation} type="video/mp4" />
                  </video>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <Avatar
            size={40}
            src={userInfo?.avatarLocation}
            alt={userInfo?.name}
            icon={<UserOutlined />}
          />
          <div className="">
            <div className="w-fit rounded-xl bg-[#F0F0F0] px-3 py-2 text-sm">
              {mes.content}
            </div>
            <div className="flex flex-1">
              {mes.mediaLocation && (
                <div className="">
                  {isImage(mes.mediaLocation) ? (
                    <img
                      className="h-auto  w-36 hover:cursor-pointer "
                      style={{ borderRadius: "12px" }}
                      src={mes.mediaLocation}
                      alt="Preview"
                      onClick={() => {
                        setOpenPreview(true);
                        setItemPreview(mes.mediaLocation);
                      }}
                    />
                  ) : (
                    <video
                      className="w-36 hover:cursor-pointer"
                      style={{ borderRadius: "12px" }}
                      onClick={() => {
                        setOpenPreview(true);
                        setItemPreview(mes.mediaLocation);
                      }}
                    >
                      <source src={mes.mediaLocation} type="video/mp4" />
                    </video>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  ));

  return (
    <Spin spinning={isFetching}>
      <div className="content-message-container" ref={messagesEndRef}>
        <div className="">
          <div className="flex flex-col gap-4">
            {messages ? renderMess : <> </>}
          </div>
          {isTyping && (
            <div className="mt-4 flex items-center gap-3">
              <Avatar size={40} />
              <span className="typing-dots">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
            </div>
          )}
          {messages.length > 0 && (
            <div className="text-gray-500 text-xs">
              Tin nhắn cuối:{" "}
              {formatDistanceToNow(
                new Date(messages[messages.length - 1].created),
                {
                  addSuffix: true,
                },
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {itemPreview && openPreview && (
          <Modal
            open={openPreview}
            onCancel={() => {
              setOpenPreview(false);
              setItemPreview(undefined);
              if (videoRef.current) {
                videoRef.current.pause();
              }
            }}
            centered
            footer={null}
          >
            <div className="mt-4 flex items-center justify-center py-4">
              {isImage(itemPreview) ? (
                <Avatar
                  size={40}
                  src={itemPreview}
                  alt=""
                  icon={<UserOutlined />}
                />
              ) : (
                <video ref={videoRef} autoPlay controls muted>
                  <source src={itemPreview} type="video/mp4" />
                </video>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Spin>
  );
}