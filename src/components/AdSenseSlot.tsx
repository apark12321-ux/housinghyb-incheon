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
  className = "",
  label = "스폰서십 안내"
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && adRef.current) {
        // 이미 push가 안 실행되었고 광고 슬롯 영역이 준비된 경우
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

  return (
    <div className={`my-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          ADVERTISEMENT · {label}
        </span>
        <span className="text-[10px] text-slate-400">하우징허브 공익 미디어 파트너</span>
      </div>

      <div className="min-h-[100px] flex items-center justify-center bg-white rounded-xl border border-slate-100 p-2 overflow-hidden">
        {slot ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
          />
        ) : (
          /* 승인 심사 대기 / 자동 광고 가동 시 표시되는 단정한 플레이스홀더 */
          <div className="py-4 px-6 text-center space-y-1">
            <p className="text-xs font-bold text-slate-600">
              하우징허브 안심 주거 지식 공익 후원 영역
            </p>
            <p className="text-[11px] text-slate-400">
              구글 애드센스 자동 광고 및 맞춤형 스폰서십 연동 준비 구역입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
