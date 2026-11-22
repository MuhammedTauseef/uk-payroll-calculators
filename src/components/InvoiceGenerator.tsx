"use client";

import { useEffect, useMemo, useState } from "react";
import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";
import { computeInvoice } from "@/lib/invoice";
import type { InvoiceItemInput, ItemKind, VatRateOption } from "@/lib/invoice";

const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";

function parseAmount(value: string): number {
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface ItemState {
  id: number;
  description: string;
  quantity: string;
  rate: string;
  vatRate: VatRateOption;
  kind: ItemKind;
}

const STORAGE_KEY = "ukp-invoice-generator-details-v1";

let nextId = 2;

export default function InvoiceGenerator() {
  // Your business + payment details — the only fields saved, and
  // only into this browser's local storage (see the load/save
  // effects below). Nothing is ever sent to a server.
  const [bizName, setBizName] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("INV-0001");
  const [issueDate, setIssueDate] = useState(todayIso());
  const [supplyDate, setSupplyDate] = useState("");
  const [termsDays, setTermsDays] = useState("30");
  const [dueDate, setDueDate] = useState(() => addDaysIso(todayIso(), 30));

  const [items, setItems] = useState<ItemState[]>([
    {
      id: 1,
      description: "",
      quantity: "1",
      rate: "",
      vatRate: "20",
      kind: "standard",
    },
  ]);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [cisPercent, setCisPercent] = useState("0");
  const [notes, setNotes] = useState(
    "Please use the invoice number as your payment reference. Thank you for your business.",
  );

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, string>;
        if (saved.bizName) setBizName(saved.bizName);
        if (saved.bizAddress) setBizAddress(saved.bizAddress);
        if (saved.bizEmail) setBizEmail(saved.bizEmail);
        if (saved.bizPhone) setBizPhone(saved.bizPhone);
        if (saved.vatNumber) setVatNumber(saved.vatNumber);
        if (saved.companyNumber) setCompanyNumber(saved.companyNumber);
        if (saved.bankName) setBankName(saved.bankName);
        if (saved.accountName) setAccountName(saved.accountName);
        if (saved.sortCode) setSortCode(saved.sortCode);
        if (saved.accountNumber) setAccountNumber(saved.accountNumber);
      }
    } catch {
      // Local storage unavailable (private window, blocked) — the
      // tool simply works without remembering, nothing breaks.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bizName,
          bizAddress,
          bizEmail,
          bizPhone,
          vatNumber,
          companyNumber,
          bankName,
          accountName,
          sortCode,
          accountNumber,
        }),
      );
    } catch {
      // As above — saving is a convenience, never a requirement.
    }
  }, [
    loaded,
    bizName,
    bizAddress,
    bizEmail,
    bizPhone,
    vatNumber,
    companyNumber,
    bankName,
    accountName,
    sortCode,
    accountNumber,
  ]);

  const totals = useMemo(() => {
    const parsed: InvoiceItemInput[] = items.map((item) => ({
      description: item.description,
      quantity: parseAmount(item.quantity),
      rate: parseAmount(item.rate),
      vatRate: item.vatRate,
      kind: item.kind,
    }));
    return computeInvoice({
      items: parsed,
      discountPercent: parseAmount(discountPercent),
      cisPercent: parseAmount(cisPercent),
    });
  }, [items, discountPercent, cisPercent]);

  const updateItem = (id: number, patch: Partial<ItemState>) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        id: nextId++,
        description: "",
        quantity: "1",
        rate: "",
        vatRate: "20",
        kind: "standard",
      },
    ]);

  const removeItem = (id: number) =>
    setItems((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev,
    );

  const onIssueDateChange = (value: string) => {
    setIssueDate(value);
    if (value) setDueDate(addDaysIso(value, parseAmount(termsDays)));
  };

  const onTermsChange = (value: string) => {
    setTermsDays(value);
    if (issueDate) setDueDate(addDaysIso(issueDate, parseAmount(value)));
  };

  const startNewInvoice = () => {
    setClientName("");
    setClientAddress("");
    setItems([
      {
        id: nextId++,
        description: "",
        quantity: "1",
        rate: "",
        vatRate: "20",
        kind: "standard",
      },
    ]);
    setDiscountPercent("0");
    setCisPercent("0");
    const today = todayIso();
    setIssueDate(today);
    setSupplyDate("");
    setDueDate(addDaysIso(today, parseAmount(termsDays)));
    // The number steps on by one where it ends in digits, so the
    // sequence the guide below recommends is the one the tool
    // itself keeps.
    setInvoiceNumber((prev) => {
      const match = prev.match(/^(.*?)(\d+)\s*$/);
      if (!match) return prev;
      const next = String(Number(match[2]) + 1).padStart(match[2].length, "0");
      return `${match[1]}${next}`;
    });
  };

  const hasBankDetails =
    bankName.trim() || accountName.trim() || sortCode.trim() || accountNumber.trim();
  const showSupplyDate = supplyDate && supplyDate !== issueDate;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-none print:shadow-none sm:p-6">
      <div className="print:hidden">
        {/* Your business */}
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Your business
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-biz-name" className={labelClass}>
              Your name / business name
            </label>
            <input
              id="inv-biz-name"
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              className={inputClass}
              placeholder="Alex Morgan Tiling"
            />
          </div>
          <div>
            <label htmlFor="inv-biz-email" className={labelClass}>
              Email
            </label>
            <input
              id="inv-biz-email"
              type="email"
              value={bizEmail}
              onChange={(e) => setBizEmail(e.target.value)}
              className={inputClass}
              placeholder="you@yourbusiness.co.uk"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="inv-biz-address" className={labelClass}>
              Your address
            </label>
            <textarea
              id="inv-biz-address"
              value={bizAddress}
              onChange={(e) => setBizAddress(e.target.value)}
              className={inputClass}
              rows={3}
              placeholder={"14 High Street\nLeeds\nLS1 4AB"}
            />
          </div>
          <div>
            <label htmlFor="inv-biz-phone" className={labelClass}>
              Phone (optional)
            </label>
            <input
              id="inv-biz-phone"
              type="tel"
              value={bizPhone}
              onChange={(e) => setBizPhone(e.target.value)}
              className={inputClass}
              placeholder="07700 900000"
            />
          </div>
          <div>
            <label htmlFor="inv-vat-number" className={labelClass}>
              VAT number (only if VAT registered)
            </label>
            <input
              id="inv-vat-number"
              type="text"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              className={inputClass}
              placeholder="GB 123 4567 89"
            />
          </div>
          <div>
            <label htmlFor="inv-company-number" className={labelClass}>
              Company number (limited companies)
            </label>
            <input
              id="inv-company-number"
              type="text"
              value={companyNumber}
              onChange={(e) => setCompanyNumber(e.target.value)}
              className={inputClass}
              placeholder="01234567"
            />
          </div>
        </div>

        {/* Your client */}
        <h2 className="mt-8 text-base font-semibold text-slate-900 dark:text-slate-50">
          Your client
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-client-name" className={labelClass}>
              Client name
            </label>
            <input
              id="inv-client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={inputClass}
              placeholder="Client or their company"
            />
          </div>
          <div>
            <label htmlFor="inv-client-address" className={labelClass}>
              Client address
            </label>
            <textarea
              id="inv-client-address"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className={inputClass}
              rows={3}
              placeholder={"Client address"}
            />
          </div>
        </div>

        {/* Invoice details */}
        <h2 className="mt-8 text-base font-semibold text-slate-900 dark:text-slate-50">
          Invoice details
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-number" className={labelClass}>
              Invoice number
            </label>
            <input
              id="inv-number"
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Unique, and next in your sequence — never reuse a number.
            </p>
          </div>
          <div>
            <label htmlFor="inv-issue-date" className={labelClass}>
              Invoice date
            </label>
            <input
              id="inv-issue-date"
              type="date"
              value={issueDate}
              onChange={(e) => onIssueDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="inv-supply-date" className={labelClass}>
              Date of supply (if different)
            </label>
            <input
              id="inv-supply-date"
              type="date"
              value={supplyDate}
              onChange={(e) => setSupplyDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The day the work was done or the goods supplied — the VAT
              tax point. Leave blank if it is the invoice date.
            </p>
          </div>
          <div>
            <label htmlFor="inv-terms" className={labelClass}>
              Payment terms
            </label>
            <select
              id="inv-terms"
              value={termsDays}
              onChange={(e) => onTermsChange(e.target.value)}
              className={inputClass}
            >
              <option value="0">Due on receipt</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <div>
            <label htmlFor="inv-due-date" className={labelClass}>
              Due date
            </label>
            <input
              id="inv-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Items */}
        <h2 className="mt-8 text-base font-semibold text-slate-900 dark:text-slate-50">
          What you are charging for
        </h2>
        <div className="mt-3 space-y-4">
          {items.map((item, index) => {
            const line = totals.lines[index];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`inv-item-desc-${item.id}`}
                      className={labelClass}
                    >
                      Description
                    </label>
                    <input
                      id={`inv-item-desc-${item.id}`}
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, { description: e.target.value })
                      }
                      className={inputClass}
                      placeholder="e.g. Bathroom tiling — labour, 3 days"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`inv-item-qty-${item.id}`}
                      className={labelClass}
                    >
                      Quantity
                    </label>
                    <input
                      id={`inv-item-qty-${item.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.5"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, { quantity: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`inv-item-rate-${item.id}`}
                      className={labelClass}
                    >
                      Rate (£, before VAT)
                    </label>
                    <input
                      id={`inv-item-rate-${item.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.id, { rate: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`inv-item-vat-${item.id}`}
                      className={labelClass}
                    >
                      VAT rate
                    </label>
                    <select
                      id={`inv-item-vat-${item.id}`}
                      value={item.vatRate}
                      onChange={(e) =>
                        updateItem(item.id, {
                          vatRate: e.target.value as VatRateOption,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="20">20% (standard)</option>
                      <option value="5">5% (reduced)</option>
                      <option value="0">0% (zero-rated)</option>
                      <option value="exempt">Exempt</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`inv-item-kind-${item.id}`}
                      className={labelClass}
                    >
                      Line type (for CIS)
                    </label>
                    <select
                      id={`inv-item-kind-${item.id}`}
                      value={item.kind}
                      onChange={(e) =>
                        updateItem(item.id, {
                          kind: e.target.value as ItemKind,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="standard">Standard</option>
                      <option value="labour">Labour (CIS applies)</option>
                      <option value="materials">Materials (no CIS)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Line total: {line ? fmtMoney(line.net) : "£0.00"}
                  </p>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800"
                    >
                      Remove line
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 rounded-full border border-brand-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-brand-800 dark:text-brand-300 shadow-sm transition hover:bg-brand-50 dark:hover:bg-brand-900/40"
        >
          + Add another line
        </button>

        {/* Discount & CIS */}
        <h2 className="mt-8 text-base font-semibold text-slate-900 dark:text-slate-50">
          Discount &amp; CIS
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-discount" className={labelClass}>
              Discount (% off the net, optional)
            </label>
            <input
              id="inv-discount"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              VAT is then charged on the discounted amount — the standard
              UK treatment when the discount is on the invoice itself.
            </p>
          </div>
          <div>
            <label htmlFor="inv-cis" className={labelClass}>
              CIS deduction (construction work)
            </label>
            <select
              id="inv-cis"
              value={cisPercent}
              onChange={(e) => setCisPercent(e.target.value)}
              className={inputClass}
            >
              <option value="0">No CIS deduction</option>
              <option value="20">CIS at 20% (registered subcontractor)</option>
              <option value="30">CIS at 30% (not registered)</option>
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Taken from the labour lines only — never from materials or
              VAT, as HMRC requires.
            </p>
          </div>
        </div>

        {/* Payment details */}
        <h2 className="mt-8 text-base font-semibold text-slate-900 dark:text-slate-50">
          How you&apos;ll be paid
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-bank-name" className={labelClass}>
              Bank name
            </label>
            <input
              id="inv-bank-name"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Barclays"
            />
          </div>
          <div>
            <label htmlFor="inv-account-name" className={labelClass}>
              Account name
            </label>
            <input
              id="inv-account-name"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={inputClass}
              placeholder="Name on the account"
            />
          </div>
          <div>
            <label htmlFor="inv-sort-code" className={labelClass}>
              Sort code
            </label>
            <input
              id="inv-sort-code"
              type="text"
              value={sortCode}
              onChange={(e) => setSortCode(e.target.value)}
              className={inputClass}
              placeholder="04-06-75"
            />
          </div>
          <div>
            <label htmlFor="inv-account-number" className={labelClass}>
              Account number
            </label>
            <input
              id="inv-account-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={inputClass}
              placeholder="12345678"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="inv-notes" className={labelClass}>
              Notes on the invoice
            </label>
            <textarea
              id="inv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              rows={2}
            />
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Private by design: everything is worked out in your browser and
          your data never leaves your browser. Your own business and bank
          details are remembered only in this browser, on this device, so
          you do not have to retype them next time — client details and
          invoice lines are not stored at all. Nothing is sent to a
          server, and there is no account to create.
        </p>
      </div>

      {/* The invoice document itself — this is what prints. */}
      <div className="mt-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-5 print:mt-0 print:border-slate-400 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-slate-800 pb-4 dark:border-slate-200">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {bizName.trim() || "Your business name"}
            </p>
            {bizAddress.trim() && (
              <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                {bizAddress.trim()}
              </p>
            )}
            {(bizEmail.trim() || bizPhone.trim()) && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {[bizEmail.trim(), bizPhone.trim()]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {vatNumber.trim() && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                VAT number: {vatNumber.trim()}
              </p>
            )}
            {companyNumber.trim() && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Company number: {companyNumber.trim()}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-slate-50">
              Invoice
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {invoiceNumber.trim() || "INV-0001"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              Bill to
            </p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
              {clientName.trim() || "Client name"}
            </p>
            {clientAddress.trim() && (
              <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">
                {clientAddress.trim()}
              </p>
            )}
          </div>
          <dl className="space-y-1">
            <div>
              <dt className="inline font-medium text-slate-900 dark:text-slate-50">
                Invoice date:{" "}
              </dt>
              <dd className="inline text-slate-700 dark:text-slate-300">
                {fmtDate(issueDate)}
              </dd>
            </div>
            {showSupplyDate && (
              <div>
                <dt className="inline font-medium text-slate-900 dark:text-slate-50">
                  Date of supply:{" "}
                </dt>
                <dd className="inline text-slate-700 dark:text-slate-300">
                  {fmtDate(supplyDate)}
                </dd>
              </div>
            )}
            <div>
              <dt className="inline font-medium text-slate-900 dark:text-slate-50">
                Due date:{" "}
              </dt>
              <dd className="inline text-slate-700 dark:text-slate-300">
                {fmtDate(dueDate)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700">
                <th className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-50">
                  Description
                </th>
                <th className="py-2 pr-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                  Qty
                </th>
                <th className="py-2 pr-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                  Rate
                </th>
                <th className="py-2 pr-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                  VAT
                </th>
                <th className="py-2 text-right font-semibold text-slate-900 dark:text-slate-50">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {totals.lines.map((line, i) => (
                <tr key={items[i]?.id ?? i}>
                  <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                    {line.description.trim() || "Description"}
                    {parseAmount(cisPercent) > 0 &&
                      line.kind !== "standard" && (
                        <span className="text-slate-500 dark:text-slate-400">
                          {" "}
                          ({line.kind})
                        </span>
                      )}
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-700 dark:text-slate-300">
                    {line.quantity || 0}
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-700 dark:text-slate-300">
                    {fmtMoney(line.rate)}
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-700 dark:text-slate-300">
                    {line.vatRate === "exempt" ? "Exempt" : `${line.vatRate}%`}
                  </td>
                  <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-50">
                    {fmtMoney(line.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 ml-auto max-w-sm space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {fmtMoney(totals.subtotal)}
            </span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">
                Discount ({parseAmount(discountPercent)}%)
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-50">
                −{fmtMoney(totals.discountAmount)}
              </span>
            </div>
          )}
          {totals.vatBreakdown.map((row) => (
            <div key={row.vatRate} className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">
                VAT {row.vatRate === "exempt" ? "(exempt)" : `at ${row.vatRate}%`}{" "}
                on {fmtMoney(row.net)}
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-50">
                {fmtMoney(row.vat)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-200 pt-1.5 dark:border-slate-800">
            <span className="font-medium text-slate-900 dark:text-slate-50">
              Invoice total
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {fmtMoney(totals.total)}
            </span>
          </div>
          {totals.cisDeduction > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  Less CIS deduction at {parseAmount(cisPercent)}% (on labour
                  of {fmtMoney(totals.cisBase)})
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  −{fmtMoney(totals.cisDeduction)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The contractor deducts this and pays it to HMRC for you —
                keep the deduction statement they must give you.
              </p>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-brand-50 px-4 py-3 dark:bg-brand-900/30 print:border print:border-slate-300">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">
            Amount due
          </p>
          <p className="text-2xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
            {fmtMoney(totals.amountDue)}
          </p>
        </div>

        {hasBankDetails && (
          <div className="mt-5 text-sm">
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              How to pay
            </p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">
              Please pay by bank transfer
              {bankName.trim() ? ` to ${bankName.trim()}` : ""}:
            </p>
            <dl className="mt-1 space-y-0.5 text-slate-700 dark:text-slate-300">
              {accountName.trim() && (
                <div>
                  <dt className="inline font-medium">Account name: </dt>
                  <dd className="inline">{accountName.trim()}</dd>
                </div>
              )}
              {sortCode.trim() && (
                <div>
                  <dt className="inline font-medium">Sort code: </dt>
                  <dd className="inline">{sortCode.trim()}</dd>
                </div>
              )}
              {accountNumber.trim() && (
                <div>
                  <dt className="inline font-medium">Account number: </dt>
                  <dd className="inline">{accountNumber.trim()}</dd>
                </div>
              )}
              <div>
                <dt className="inline font-medium">Reference: </dt>
                <dd className="inline">
                  {invoiceNumber.trim() || "INV-0001"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {notes.trim() && (
          <p className="mt-5 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
            {notes.trim()}
          </p>
        )}

        <p className="mt-6 border-t border-slate-200 pt-3 text-xs text-slate-400 dark:border-slate-800">
          Made with the free invoice generator from UK Payroll Calculators
          (payrollcalc.co.uk) — worked out entirely in the browser; no data
          was uploaded.
        </p>
      </div>

      <div className="print:hidden">
        <PrintButton
          label="Print / save this invoice as a PDF"
          printedWhat="the invoice on its own"
        />
        <button
          type="button"
          onClick={startNewInvoice}
          className="mt-4 ml-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-brand-300 dark:hover:border-brand-700"
        >
          Start a new invoice
        </button>
      </div>

      <StickyResultBar label="Amount due" value={fmtMoney(totals.amountDue)} />
    </div>
  );
}
