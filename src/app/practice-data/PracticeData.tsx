"use client";
import UploadModel from "@/model/UploadModel";
import Handsigns from "@/utils/handsigns";
import { WarningFilled } from "@ant-design/icons";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, Hands, Results, VERSION } from "@mediapipe/hands";
import { useMutation } from "@tanstack/react-query";
import { Button, Image, Modal, Spin, Tabs, Tooltip, message } from "antd";
import * as fp from "fingerpose";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder-2";
import Webcam from "react-webcam";
import { formatTime } from "../collect-data/CollectData";
import LearningData from "./LearningData";

const PracticeData: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimerId, setRecordingTimerId] = useState<any>(null);
  const [showModalPreview, setShowModalPreview] = useState<{
    open: boolean;
    preview: string | undefined;
    type: string;
  }>({ open: false, preview: "", type: "" });
  const [mediaFile, setMediaFile] = useState("");
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);

  // Kết quả sau khi xử lý AI
  const [resultContent, setResultContent] = useState<{
    content: string;
  }>({
    content: "",
  });

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file: any) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    const sendToMediaPipe = async () => {
      if (webcamRef.current && webcamRef.current.video && webcamReady) {
        if (!webcamRef.current.video.videoWidth) {
          requestAnimationFrame(sendToMediaPipe);
        } else {
          await hands.send({ image: webcamRef.current.video });
          requestAnimationFrame(sendToMediaPipe);
        }
      }
    };

    if (webcamReady) {
      contextRef.current = canvasRef.current?.getContext("2d") || null;
      sendToMediaPipe();
    }

    return () => {
      if (hands) {
        hands.close();
      }
    };
  }, [webcamReady]);

  const onResults = async (results: Results) => {
    if (canvasRef.current && contextRef.current) {
      setLoaded(true);

      contextRef.current.save();
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      contextRef.current.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      if (
        results.multiHandLandmarks?.length &&
        results.multiHandedness?.length
      ) {
        for (
          let index = 0;
          index < results.multiHandLandmarks.length;
          index++
        ) {
          const landmarks = results.multiHandLandmarks[index];
          const GE = new fp.GestureEstimator([
            Handsigns.aSign,
            Handsigns.bSign,
            Handsigns.cSign,
            Handsigns.dSign,
            Handsigns.eSign,
            Handsigns.fSign,
            Handsigns.gSign,
            Handsigns.hSign,
            Handsigns.iSign,
            Handsigns.jSign,
            Handsigns.kSign,
            Handsigns.lSign,
            Handsigns.mSign,
            Handsigns.nSign,
            Handsigns.oSign,
            Handsigns.pSign,
            Handsigns.qSign,
            Handsigns.rSign,
            Handsigns.sSign,
            Handsigns.tSign,
            Handsigns.uSign,
            Handsigns.vSign,
            Handsigns.wSign,
            Handsigns.xSign,
            Handsigns.ySign,
            Handsigns.zSign,
          ]);
          const handData: any = results.multiHandLandmarks[0].map((item) => [
            item.x,
            item.y,
            item.z,
          ]);
          const gesture = await GE.estimate(handData, 6.5);
          console.log("gesture.gestures", gesture.gestures);

          if (gesture.gestures && gesture.gestures.length > 0) {
            const confidence = gesture.gestures.map((p) => p.score);
            const maxConfidence = confidence.indexOf(
              Math.max.apply(undefined, confidence),
            );

            setEmoji(gesture.gestures[maxConfidence].name);
          } else {
            setEmoji("");
          }

          drawConnectors(contextRef.current, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(contextRef.current, landmarks, {
            color: "#FF0000",
            fillColor: "#FF0000",
            lineWidth: 2,
            radius: (data: any) => {
              return lerp(data.z || 0, -0.15, 0.1, 10, 1);
            },
          });
        }
      } else {
        setEmoji("");
      }

      contextRef.current.restore();
    }
  };

  const handleWebcamReady = useCallback(() => {
    setWebcamReady(true);
  }, []);

  const handleStartRecording = (startRecording: any) => {
    startRecording();
    const timerId = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    setRecordingTimerId(timerId);
  };

  const uploadVideo = async (mediaBlobUrl: any) => {
    const formData = new FormData();
    const response = await fetch(mediaBlobUrl as any);
    const blob: any = await response.blob();
    const metadata = { type: blob.type, lastModified: blob.lastModified };
    const file = new File([blob], `volunteer_${Date.now()}.mp4`, metadata);
    formData.append("file", file);
    return await UploadModel.uploadFile(formData);
  };

  const handleStopRecording = async (stopRecording: any, mediaBlobUrl: any) => {
    stopRecording();
    clearInterval(recordingTimerId);
    setRecordingTime(0);
    setShowModalPreview({
      ...showModalPreview,
      type: "video",
    });
    const link = await uploadVideo(mediaBlobUrl);
    setMediaFile(link || "");
    message.success("Video đã được lưu. Bạn có thể xem lại video");
  };

  // Kiểm tra AI
  const mutationDetectAI = useMutation({
    mutationFn: UploadModel.checkAI,
    onSuccess: (res) => {
      message.success("Xử lý dữ liệu thành công");
      setResultContent({ content: res.data?.content });
      setMediaFile("");
    },
  });

  return (
    <>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Luyện tập các ký tự" key="1">
          <div className="relative flex h-[500px] items-center justify-between overflow-hidden bg-gray-2">
            <div className="w-1/2">
              <Webcam
                className="absolute left-0 top-0 z-999 object-contain"
                width={600}
                height={400}
                ref={webcamRef}
                audio={false}
                onUserMedia={handleWebcamReady}
              />
              <ReactMediaRecorder
                video={true}
                render={({
                  status,
                  startRecording,
                  stopRecording,
                  mediaBlobUrl,
                }) => (
                  <div className="absolute bottom-0 left-0 z-999 flex gap-4 object-contain">
                    <p>Trạng thái quay video: {status}</p>
                    <Button
                      onClick={() => handleStartRecording(startRecording)}
                      disabled={status === "recording"}
                      icon={
                        <Tooltip
                          title="Thời gian tối đa cho mỗi video là 5s."
                          placement="top"
                          trigger="hover"
                          color="#4096ff"
                        >
                          <WarningFilled style={{ color: "#4096ff" }} />
                        </Tooltip>
                      }
                    >
                      Bắt đầu quay
                      {recordingTime !== 0 && (
                        <p style={{ color: "red" }}>
                          {formatTime(recordingTime)}
                        </p>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        handleStopRecording(stopRecording, mediaBlobUrl);
                      }}
                      disabled={status !== "recording"}
                    >
                      Dừng quay
                    </Button>
                    <Button
                      disabled={!mediaBlobUrl}
                      onClick={() => {
                        if (showModalPreview.type === "image") {
                          setShowModalPreview({
                            ...showModalPreview,
                            open: true,
                          });
                        } else {
                          setShowModalPreview({
                            ...showModalPreview,
                            open: true,
                            preview: mediaBlobUrl,
                          });
                        }
                      }}
                    >
                      Xem lại file
                    </Button>
                  </div>
                )}
              />

              <canvas
                ref={canvasRef}
                width={600}
                height={450}
                className="absolute left-0 top-0 z-999 object-cover"
              />
              <div
                style={{
                  top: "10%",
                  position: "absolute",
                  left: "25%",
                  marginLeft: "auto",
                  marginRight: "auto",
                  textAlign: "center",
                  zIndex: 999,
                }}
                className="text-[50px] text-red"
              >
                {emoji}
              </div>
            </div>
            <div className="flex w-1/2 justify-center gap-x-5">
              kết quả
              <Spin spinning={mutationDetectAI.isPending}>
                <div className="text-center text-[60px] font-bold">
                  {resultContent.content}
                </div>
              </Spin>
            </div>
          </div>
          <div className="mt-4 flex w-full justify-center">
            <Button
              size="large"
              type="primary"
              disabled={!mediaFile}
              className="text-center"
              onClick={() => mutationDetectAI.mutate({ videoUrl: mediaFile })}
            >
              Kiểm tra
            </Button>
          </div>
          {!loaded && (
            <div className="loading absolute inset-0 z-999 flex items-center justify-center bg-gray-2">
              <div className="spinner h-32 w-32 animate-spin rounded-full border-8 border-t-8 border-t-blue-500"></div>
              <div className="absolute text-xl text-white">Loading</div>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Luyện tập theo bảng chữ cái" key="2">
          <LearningData />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal xem lại */}
      <Modal
        open={showModalPreview.open}
        onCancel={() =>
          setShowModalPreview({ ...showModalPreview, open: false })
        }
        footer={null}
        title={
          showModalPreview.type === "image" ? "Xem lại ảnh: " : "Xem lại video"
        }
        zIndex={10000}
      >
        {!(showModalPreview.type === "video") ? (
          <Image preview={false} src={showModalPreview.preview} alt="preview" />
        ) : (
          <video controls src={showModalPreview.preview}></video>
        )}
      </Modal>
    </>
  );
};

export default PracticeData;
