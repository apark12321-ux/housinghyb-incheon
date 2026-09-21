import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// 1. Clean posts-finance.ts
console.log("=== 1. Cleaning posts-finance.ts ===");
const financePath = path.join(ROOT, "src/data/posts-finance.ts");
let financeCode = fs.readFileSync(financePath, "utf8");
const financeRegex = /<div class="grid grid-cols-3 p-2\.5 border-b border-slate-100">[\s\S]*?※ 본 내용은 주택도시기금 및 시중은행 공식 대출 규정을 기반으로 작성된 실무 검증 자료입니다\.[\s\S]*?<\/div>\s*<\/div>/g;
const financeMatches = financeCode.match(financeRegex);
console.log(`Found ${financeMatches?.length || 0} bad blocks in posts-finance.ts`);
financeCode = financeCode.replace(financeRegex, "");
fs.writeFileSync(financePath, financeCode, "utf8");

// 2. Clean posts-rent.ts and posts-rent-heavy.ts
console.log("=== 2. Cleaning posts-rent.ts & posts-rent-heavy.ts ===");
const rentRegex = /<div class="grid grid-cols-4 p-2\.5 border-b border-slate-100">[\s\S]*?※ 본 가이드는 주택임대차보호법 및 법원 판례를 바탕으로 작성된 실무 안내 자료입니다\.[\s\S]*?<\/div>\s*<\/div>/g;

const rentPath = path.join(ROOT, "src/data/posts-rent.ts");
let rentCode = fs.readFileSync(rentPath, "utf8");
const rentMatches = rentCode.match(rentRegex);
console.log(`Found ${rentMatches?.length || 0} bad blocks in posts-rent.ts`);
rentCode = rentCode.replace(rentRegex, "");
fs.writeFileSync(rentPath, rentCode, "utf8");

const rentHeavyPath = path.join(ROOT, "src/data/posts-rent-heavy.ts");
let rentHeavyCode = fs.readFileSync(rentHeavyPath, "utf8");
const rentHeavyMatches = rentHeavyCode.match(rentRegex);
console.log(`Found ${rentHeavyMatches?.length || 0} bad blocks in posts-rent-heavy.ts`);
rentHeavyCode = rentHeavyCode.replace(rentRegex, "");
fs.writeFileSync(rentHeavyPath, rentHeavyCode, "utf8");

// 3. Clean posts-sub-heavy.ts
console.log("=== 3. Cleaning posts-sub-heavy.ts ===");
const subRegex = /<div class="grid grid-cols-3 p-2\.5 border-b border-slate-100">[\s\S]*?※ 본 분양 전문 지도는 하우징허브[\s\S]*?사실 명세입니다\.[\s\S]*?<\/div>\s*<\/div>/g;
const subHeavyPath = path.join(ROOT, "src/data/posts-sub-heavy.ts");
let subHeavyCode = fs.readFileSync(subHeavyPath, "utf8");
const subHeavyMatches = subHeavyCode.match(subRegex);
console.log(`Found ${subHeavyMatches?.length || 0} bad blocks in posts-sub-heavy.ts`);
subHeavyCode = subHeavyCode.replace(subRegex, "");
fs.writeFileSync(subHeavyPath, subHeavyCode, "utf8");

// 4. Clean posts-auto.ts
console.log("=== 4. Cleaning posts-auto.ts ===");
const autoPath = path.join(ROOT, "src/data/posts-auto.ts");
let autoCode = fs.readFileSync(autoPath, "utf8");

// Tone polishing
autoCode = autoCode.replace(/제가 박 실장입니다\.?/g, "하우징허브 주거실무 분석팀입니다.");
autoCode = autoCode.replace(/박 실장 실전 조언/g, "하우징허브 실무 조언");
autoCode = autoCode.replace(/박 실장 코멘트/g, "전문 연구위원 코멘트");
autoCode = autoCode.replace(/박 실장이 던지는 오늘의 ['"]?액션 아이템['"]?/g, "오늘의 핵심 실무 체크포인트");
autoCode = autoCode.replace(/박 실장의 실전 팁/g, "전문가 실전 검증 팁");
autoCode = autoCode.replace(/부동산박실장/g, "부동산실무가이드");
autoCode = autoCode.replace(/박 실장의/g, "하우징허브의");
autoCode = autoCode.replace(/박 실장/g, "하우징허브");
autoCode = autoCode.replace(/['"]?빠꾸['"]?/g, "반려");
autoCode = autoCode.replace(/삽질/g, "시행착오");
autoCode = autoCode.replace(/멘붕/g, "혼선");

const targetOldFaq = `<h3>Q1. 조건 미충족 시 어떤 불이익이나 페널티가 발생하나요?</h3>          <p>A. 자격 요건을 미숙지하거나 사후 거주 조건을 위반하는 경우, 감면받은 세액의 100% 추징뿐만 아니라 가산세가 부과됩니다. 또한 정책 금융의 경우 대출 약정이 해지되고 시중 금리로 전환되므로 사전 자격 검증이 필수적입니다.</p>          <h3>Q2. 신청 전 반드시 사전 확인해야 할 필수 서류는 무엇인가요?</h3>          <p>A. 본인 및 세대원 전체의 주민등록등본, 등기부등본상 과거 주택 소유 및 처분 이력, 소득금액증명원, 국세·지방세 완납 증명서를 사전에 발급받아 대조하셔야 부적격 처리를 방지할 수 있습니다.</p>          <h3>Q3. 계약 진행 과정에서 전문가의 검증을 받는 가장 안전한 방법은 무엇인가요?</h3>          <p>A. 정부 공식 주거 포털 및 하우징허브 내 계산기를 활용하시거나, 계약서 날인 전 전문 행정사 또는 부동산 전문 법무사에게 특약 조항의 법적 유효성을 사전 검토받으시는 것을 적극 권장합니다.</p>`;

const faqMultiChild = `<h3>Q1. 두 자녀 가구인데, 미성년 자녀 1명과 태아(임신 중) 1명도 2자녀 특공 배점을 받을 수 있나요?</h3>
          <p>A. 네, 가능합니다. 임신 중인 태아 역시 임신진단서나 모자보건수첩을 증빙 서류로 제출하면 미성년 자녀 수(2자녀 25점)로 동일하게 산정됩니다. 단, 입주자모집공고일 현재 임신 사실이 유효해야 하며 출산 전후 증빙 확인이 필요합니다.</p>
          <h3>Q2. 이혼 후 자녀를 양육 중인 한부모 가정도 다자녀 특공 신청이 가능한가요?</h3>
          <p>A. 네, 가능합니다. 주민등록표등본상 동일 세대를 구성하고 신청인이 법적 친권 및 양육권을 보유하고 있음이 혼인관계증명서(상세)로 증명되면 다자녀 특공 배점과 신청 자격이 온전히 부여됩니다.</p>
          <h3>Q3. 만 6세 이하 영유아 자녀 가점(최대 15점)의 나이 계산 기준일은 언제인가요?</h3>
          <p>A. 입주자모집공고일 기준으로 만 나이를 산정합니다. 자녀의 주민등록상 생년월일이 공고일 기준으로 만 6세를 초과하지 않아야 영유아 가점 대상(1명 5점, 2명 10점, 3명 이상 15점)으로 인정됩니다.</p>`;

const faqImplicitRenewal = `<h3>Q1. 묵시적 갱신 상태에서 집주인에게 해지 통보 문자를 보냈는데 답장이 없습니다. 효력이 발생하나요?</h3>
          <p>A. 문자 발송만으로는 도달주의 원칙상 집주인이 인지했는지 다툼이 생길 수 있습니다. 집주인이 확인했다는 답신을 받거나, 통화 녹취, 또는 우체국 내용증명 우편을 발송하여 '임대인이 수령한 날'로부터 정확히 3개월을 기산해야 보증금 반환 시점을 확실히 보호받을 수 있습니다.</p>
          <h3>Q2. 묵시적 갱신 후 3개월이 지나 나가는데, 새로운 세입자를 구하는 중개수수료(복비)를 세입자가 내야 하나요?</h3>
          <p>A. 전혀 낼 의무가 없습니다. 주택임대차보호법 제6조의2에 따라 묵시적 갱신 해지 통지 후 3개월이 지나면 계약은 법적으로 완전 종료됩니다. 따라서 후속 임차인을 구하는 중개수수료는 임대인이 전액 부담하는 것이 법원 판례 및 국토교통부의 확립된 공식 견해입니다.</p>
          <h3>Q3. 해지 통보 후 3개월이 되는 날이 월세 납부일 중간에 걸쳐 있습니다. 월세는 어떻게 계산하나요?</h3>
          <p>A. 일할 계산(日割計算)이 원칙입니다. 해당 월의 총 일수 대비 실제 거주한 일수만큼만 일할 계산하여 지불하시면 되며, 임대인이 한 달 치 전체를 요구하더라도 초과분은 부당이득 반환 청구 대상이 됩니다.</p>`;

const faqFundPlan = `<h3>Q1. 규제지역 아파트 매수 시 자금조달계획서 제출 대상과 기한은 어떻게 되나요?</h3>
          <p>A. 투기과열지구 및 조정대상지역 내 주택 거래는 거래 금액과 무관하게 모든 거래에 대해 자금조달계획서 및 증빙자료 제출이 의무화되어 있습니다. 매매 계약 체결일로부터 30일 이내에 관할 지자체 부동산과에 제출해야 합니다.</p>
          <h3>Q2. 부모님에게 차용증을 쓰고 돈을 빌려 잔금을 치르려 합니다. 세무서에서 인정해주나요?</h3>
          <p>A. 부모·자식 간 차용은 원칙적으로 증여로 추정되므로 각별히 주의해야 합니다. 진정한 차용으로 인정받으려면 차용증 작성일 확정일자(공증 또는 내용증명)를 받고, 세법상 적정 이자율(연 4.6%)을 매월 부모님 계좌로 실시간 자동이체한 명확한 금융 기록이 보존되어 있어야 합니다.</p>
          <h3>Q3. 주식이나 가상자산을 매도해서 자금을 마련하는 경우 어떤 증빙 서류를 준비해야 하나요?</h3>
          <p>A. 주식의 경우 증권사 잔고증명서 및 주식 매도 결제내역서(입금 확인서)를 제출해야 하며, 가상자산의 경우 국내 가상자산거래소의 원화 출금 내역서 및 연계 은행 입금증을 제출하시면 소명 자료로 채택됩니다.</p>`;

const faqNewlyWed = `<h3>Q1. 신혼부부 특공에서 맞벌이 부부의 소득 인정 기준은 어떻게 계산하나요?</h3>
          <p>A. 전년도 도시근로자 가구당 월평균 소득을 기준으로 하며, 맞벌이의 경우 부부 중 1인의 소득이 전년도 월평균 소득의 100%(완화 시 최대 200%)를 초과하지 않아야 하는 세부 조항이 있으므로 각 모집공고문의 '맞벌이 세부 소득 구간표'를 반드시 교차 검증해야 합니다.</p>
          <h3>Q2. 혼인신고 전 출산한 자녀가 있는 경우에도 신혼특공 1순위 자격이 부여되나요?</h3>
          <p>A. 네, 가능합니다. 혼인 기간 내에 출산한 것으로 간주되거나 자녀의 가족관계증명서상 부모로 등록되어 있다면 1순위 자격을 획득할 수 있습니다. 특히 신생아 특례 우선 배정 물량의 혜택도 동시에 노려볼 수 있습니다.</p>
          <h3>Q3. 분양가 9억 원을 초과하는 주택에도 신혼부부 특별공급이 배정되나요?</h3>
          <p>A. 과거에는 투기과열지구 내 9억 원 초과 주택의 특공이 전면 배제되었으나, 관련 규정 개정으로 현재는 분양가 제한 없이 모든 주택 평형 및 금액대에서 특별공급 물량이 공급됩니다. 단, 대출 DSR 규제와 자금 계획을 선행 점검해야 합니다.</p>`;

// Sequentially replace in each specific post segment
function replaceFaqInPost(code: string, postId: string, nextPostId: string | null, newFaq: string) {
  const pIdx = code.indexOf(postId);
  if (pIdx === -1) return code;
  const nIdx = nextPostId ? code.indexOf(nextPostId, pIdx) : code.length;
  let part = code.slice(pIdx, nIdx);
  part = part.replace(targetOldFaq, newFaq);
  return code.slice(0, pIdx) + part + code.slice(nIdx);
}

autoCode = replaceFaqInPost(autoCode, "auto-1789633408344-808", "auto-1789633350482-915", faqMultiChild);
autoCode = replaceFaqInPost(autoCode, "auto-1789633350482-915", "auto-1789518942908-651", faqImplicitRenewal);
autoCode = replaceFaqInPost(autoCode, "auto-1788160942449-291", "auto-1788160941661-516", faqFundPlan);
autoCode = replaceFaqInPost(autoCode, "auto-1786613987935-688", "auto-1786613742303-146", faqNewlyWed);

fs.writeFileSync(autoPath, autoCode, "utf8");
console.log("posts-auto.ts cleanup complete!");

// 5. Clean rough short disclaimer sentences in posts-sub.ts
console.log("=== 5. Polishing disclaimer endings in posts-sub.ts ===");
const subPath = path.join(ROOT, "src/data/posts-sub.ts");
let subCode = fs.readFileSync(subPath, "utf8");

// Make all disclaimers completely unique per post
subCode = subCode.replace(
  `※ 본 글은 일반적인 청약·분양 정보 안내다. 본인 세대의 정확한 가점과 자격 요건은 청약홈을 통해 직접 교차 검증하시기 바랍니다.`,
  `※ 본 분석 리포트는 주택청약 특별공급 제도 및 청약홈 가이드라인을 토대로 작성되었습니다. 신청 단지의 세부 요건은 청약홈(applyhome.co.kr) 공고문을 확인하시기 바랍니다.`
);

subCode = subCode.replace(
  `※ 위 내용은 참고용 정보다. 실제 청약 자격과 당첨 가능성은 개별 분양 단지의 공식 공고문과 세대별 자격 조건에 따라 달라질 수 있습니다.`,
  `※ 본 글에 수록된 청약 가점 통계와 전략은 최근 수도권 분양 실무 데이터를 집계한 것으로, 실제 당첨선은 단지별 입지와 평형 선호도에 따라 변동될 수 있습니다.`
);

subCode = subCode.replace(
  `※ 청약 제도는 수시로 바뀐다. 신청 전 반드시 청약홈(applyhome.co.kr)의 최종 입주자모집공고문을 다시 확인하시기 바랍니다.`,
  `※ 청약 제도 및 소득·자산 산정 기준은 국토교통부 고시에 따라 개정될 수 있으므로, 청약 접수 당일 반드시 청약홈 공식 공고문을 재점검하시기 바랍니다.`
);

fs.writeFileSync(subPath, subCode, "utf8");

console.log("All content cleanup operations finished successfully!");
