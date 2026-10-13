// 計算機（FireCalc）の計算部分。3つの形の年間負担を出す。
//   A：個人・源泉徴収あり（確定申告しない）
//   B：個人・確定申告する
//   C：マイクロ法人（役員報酬＋確定申告）
// 税の数字は令和8年分（2026年）の制度。国保の軽減と上限は令和8年度の国の基準。

export type CalcInput = {
	capGain: number; // 売って出た利益（譲渡益）・円
	dividend: number; // 配当・円
	nhiRate: number; // 国保の所得割の率（％・合計）
	nhiFlat: number; // 国保の均等割（1人の年額・円）
	persons: number; // 国保と国民年金に入る人数
	pension: number; // 国民年金（1人の年額・円）
	idecoSolo: number; // iDeCo（個人のとき・年額・円）
	idecoCorp: number; // iDeCo（法人のとき・年額・円）
	salaryMonthly: number; // 役員報酬（月額・円）
	shaho: number; // 法人の社会保険料（会社と本人の合計・年額・円）
	keep: number; // 法人の維持費（年額・円）
};

export type Row = {
	tax: number; // 所得税＋住民税
	health: number; // 健康保険（国保、または会社の健康保険＋厚生年金のうち健保相当は分けず shaho に入れる）
	pension: number; // 国民年金
	shaho: number; // 法人の社会保険料
	keep: number; // 法人の維持費
	total: number;
	reduction: number; // 国保の均等割の軽減（0.7 / 0.5 / 0.2 / 0）
};

const NHI_BASE = 430000; // 国保の基礎控除。7割軽減の基準も同じ
const NHI_PER50 = 310000; // 5割軽減：1人あたりの加算
const NHI_PER20 = 570000; // 2割軽減：1人あたりの加算
const NHI_CAP = 1130000; // 国保の上限（4区分の合計）
const BASIC_RT = 430000; // 住民税の基礎控除
const SALARY_DED = 740000; // 給与所得控除の最低額
const RT_FLAT = 5000; // 住民税の均等割（森林環境税を含む）
const RT_FLAT_LIMIT = 450000; // この所得以下なら均等割もかからない
const EMPLOYEE_SHARE = 0.493; // 社会保険料のうち本人が払う割合（残りは会社）

// 所得税の基礎控除（合計所得に応じて変わる）
const BASIC_IT: [number, number][] = [
	[4890000, 1040000],
	[6550000, 670000],
	[23500000, 620000],
	[24000000, 480000],
	[24500000, 320000],
	[25000000, 160000],
	[Infinity, 0],
];

function basicIT(totalIncome: number) {
	for (const [limit, amount] of BASIC_IT) if (totalIncome <= limit) return amount;
	return 0;
}

function progressiveIT(taxable: number) {
	const brackets: [number, number, number][] = [
		[1950000, 0.05, 0],
		[3300000, 0.1, 97500],
		[6950000, 0.2, 427500],
		[9000000, 0.23, 636000],
		[18000000, 0.33, 1536000],
		[40000000, 0.4, 2796000],
		[Infinity, 0.45, 4796000],
	];
	if (taxable <= 0) return 0;
	for (const [limit, rate, ded] of brackets) if (taxable <= limit) return taxable * rate - ded;
	return 0;
}

export function nhiReduction(income: number, persons: number) {
	if (income <= NHI_BASE) return 0.7;
	if (income <= NHI_BASE + NHI_PER50 * persons) return 0.5;
	if (income <= NHI_BASE + NHI_PER20 * persons) return 0.2;
	return 0;
}

function nhi(income: number, v: CalcInput) {
	const reduction = nhiReduction(income, v.persons);
	const amount =
		Math.max(0, income - NHI_BASE) * (v.nhiRate / 100) + v.nhiFlat * v.persons * (1 - reduction);
	return { total: Math.round(Math.min(amount, NHI_CAP)), reduction };
}

// 所得税＋住民税。配当は総合課税、売った利益は申告分離課税。余った控除は売った利益から引く
function taxes(o: { salaryIncome: number; dividend: number; capGain: number; socialDed: number; ideco: number }) {
	const totalIncome = o.salaryIncome + o.dividend + o.capGain;
	const ordinary = o.salaryIncome + o.dividend;

	const dedIT = basicIT(totalIncome) + o.socialDed + o.ideco;
	const taxableCapIT = Math.max(0, o.capGain - Math.max(0, dedIT - ordinary));
	let it = progressiveIT(Math.max(0, ordinary - dedIT)) + taxableCapIT * 0.15;
	it = Math.max(0, it - o.dividend * 0.1); // 配当控除
	it = Math.floor((it * 1.021) / 100) * 100; // 復興特別所得税

	const dedRT = BASIC_RT + o.socialDed + o.ideco;
	const taxableCapRT = Math.max(0, o.capGain - Math.max(0, dedRT - ordinary));
	let rt = Math.max(0, ordinary - dedRT) * 0.1 + taxableCapRT * 0.05;
	rt = Math.max(0, rt - o.dividend * 0.028);
	rt = Math.floor(rt / 100) * 100;

	return it + rt + (totalIncome > RT_FLAT_LIMIT ? RT_FLAT : 0);
}

export function calcAll(v: CalcInput): { a: Row; b: Row; c: Row } {
	const gain = v.capGain + v.dividend;
	const pension = v.pension * v.persons;

	// A：申告しない。利益の20.315%が引かれて終わり。国保は所得0円の扱い（住民税の申告は必要）
	const nA = nhi(0, v);
	const taxA = Math.floor((gain * 0.15315) / 100) * 100 + Math.floor((gain * 0.05) / 100) * 100;
	const a: Row = { tax: taxA, health: nA.total, pension, shaho: 0, keep: 0, total: 0, reduction: nA.reduction };

	// B：確定申告する。控除で税を取り戻すかわりに、利益が国保に乗る
	const nB = nhi(gain, v);
	const taxB = taxes({
		salaryIncome: 0,
		dividend: v.dividend,
		capGain: v.capGain,
		socialDed: nB.total + pension,
		ideco: v.idecoSolo,
	});
	const b: Row = { tax: taxB, health: nB.total, pension, shaho: 0, keep: 0, total: 0, reduction: nB.reduction };

	// C：法人。社会保険料は役員報酬で決まり、利益がいくらでも変わらない
	const taxC = taxes({
		salaryIncome: Math.max(0, v.salaryMonthly * 12 - SALARY_DED),
		dividend: v.dividend,
		capGain: v.capGain,
		socialDed: Math.round(v.shaho * EMPLOYEE_SHARE),
		ideco: v.idecoCorp,
	});
	const c: Row = { tax: taxC, health: 0, pension: 0, shaho: v.shaho, keep: v.keep, total: 0, reduction: 0 };

	for (const r of [a, b, c]) r.total = r.tax + r.health + r.pension + r.shaho + r.keep;
	return { a, b, c };
}
