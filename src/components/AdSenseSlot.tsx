import React, { useEffect, useRef, useState } from "react";

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
  slot = "1098765432",
  format = "auto",
  responsive = "true",
  className = "",
  label = "ADVERTISEMENT"
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef<boolean>(false);
  const [isAdLoaded, setIsAdLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && adRef.current) {
        const adsbygoogle = (window as any).adsbygoogle;
        if (adsbygoogle && !pushedRef.current && slot) {
          adsbygoogle.push({});
          pushedRef.current = true;
          setIsAdLoaded(true);
        }
      }
    } catch (e) {
      console.warn("AdSense push notification error:", e);
    }
  }, [slot]);

  return (
    <div className={`my-8 text-center overflow-hidden rounded-2xl bg-slate-50 border border-slate-200/80 p-4 transition-all shadow-2xs ${className}`}>
      {/* 상단 라벨 헤더 */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2 px-1 border-b border-slate-200/60 pb-1.5">
        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>{label}</span>
        </span>
        <span className="text-[9px] text-slate-400 tracking-wider font-semibold">Google AdSense</span>
      </div>

      {/* Google AdSense ins 인스턴스 */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "90px" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />

      {/* 실시간 광고 미로드/샌드박스 환경용 스마트 가상 디스플레이 광고 카드 (CTR 최적화 미리보기) */}
      {!isAdLoaded && (
        <div className="py-3 px-4 bg-white rounded-xl border border-dashed border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-2xs">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <span className="text-lg">📢</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">맞춤 안내</span>
                <p className="text-xs font-bold text-slate-800 truncate">실수요자를 위한 주거 금융 &amp; 대출 특약 보장 정보</p>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">최저 금리 한도 계산 및 보증금 반환 안심 특약 가이드라인</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer">
            자세히 보기 &rarr;
          </span>
        </div>
      )}
    </div>
  );
};

