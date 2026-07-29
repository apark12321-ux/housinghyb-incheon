import React, { useEffect, useRef } from "react";

interface AdSenseSlotProps {
  client?: string;
  slot?: string;
  format?: string;
  responsive?: string;
  className?: string;
  label?: string;
}

export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  client = "ca-pub-9552509372228899",
  slot,
  format = "auto",
  responsive = "true",
  className = ""
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && adRef.current) {
        const adsbygoogle = (window as any).adsbygoogle || [];
        if (!pushedRef.current && slot) {
          adsbygoogle.push({});
          pushedRef.current = true;
        }
      }
    } catch (e) {
      console.warn("AdSense push notification error:", e);
    }
  }, [slot]);

  // slot이 없으면 자동 광고(Auto Ads)에 맡기므로 가짜 가공 문구 박스를 노출하지 않고 clean 처리
  if (!slot) {
    return null;
  }

  return (
    <div className={`my-6 text-center overflow-hidden ${className}`}>
      <span className="text-[10px] text-slate-400 font-mono block mb-1">ADVERTISEMENT</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};
