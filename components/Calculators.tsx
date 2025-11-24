import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const InputField = ({ label, value, onChange, type = "number", min }: any) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{label}</label>
    <input
      type={type}
      min={min}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-accent transition-colors font-serif text-lg"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-accent transition-colors font-serif text-lg"
    >
      {options.map((opt: number) => (
        <option key={opt} value={opt}>{opt} раз/год</option>
      ))}
    </select>
  </div>
);

export const Calculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'duty' | 'npv'>('duty');

  return (
    <div className="bg-white p-6 md:p-10 shadow-lg border border-gray-100 w-full mx-auto my-8">
      <div className="flex justify-center space-x-8 mb-10 border-b border-gray-100 pb-4">
        <button
          onClick={() => setActiveTab('duty')}
          className={`text-sm uppercase tracking-widest pb-2 transition-all ${
            activeTab === 'duty' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-primary'
          }`}
        >
          Госпошлина
        </button>
        <button
          onClick={() => setActiveTab('npv')}
          className={`text-sm uppercase tracking-widest pb-2 transition-all ${
            activeTab === 'npv' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-primary'
          }`}
        >
          Расчет NPV (Реструктуризация)
        </button>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'duty' ? <StateDutyCalculator /> : <RestructuringNPVCalculator />}
      </div>
    </div>
  );
};

const StateDutyCalculator = () => {
  const [amount, setAmount] = useState<number>(1000000);
  
  const duty = useMemo(() => {
    // Art 333.21 NK RF 2025
    let res = 0;
    if (amount <= 100000) {
      res = 10000;
    } else if (amount <= 1000000) {
      res = 10000 + (amount - 100000) * 0.05;
    } else if (amount <= 10000000) {
      res = 55000 + (amount - 1000000) * 0.03;
    } else if (amount <= 50000000) {
      res = 325000 + (amount - 10000000) * 0.01;
    } else {
      res = 725000 + (amount - 50000000) * 0.005;
    }
    if (res > 10000000) res = 10000000; 
    
    return Math.floor(res);
  }, [amount]);

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <InputField label="Цена иска (сумма долга, руб.)" value={amount} onChange={(v: string) => setAmount(Number(v))} />
        <p className="text-gray-400 text-xs mt-4">
          *Расчет согласно ст. 333.21 НК РФ. Применяется для имущественных споров в Арбитражных судах.
        </p>
      </div>
      <div className="text-center p-8 bg-background border border-border">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Госпошлина к уплате</h3>
        <p className="text-4xl font-serif text-accent">{duty.toLocaleString('ru-RU')} ₽</p>
      </div>
    </div>
  );
};

const RestructuringNPVCalculator = () => {
  // Scenario 1: Initial Conditions
  const [initNominal, setInitNominal] = useState(1000);
  const [initRate, setInitRate] = useState(15);
  const [initFreq, setInitFreq] = useState(4); // 2, 4, 12
  const [initYears, setInitYears] = useState(3);

  // Scenario 2: Restructuring Conditions
  const [restNominal, setRestNominal] = useState(1000);
  const [restRate, setRestRate] = useState(10);
  const [restFreq, setRestFreq] = useState(4);
  const [restYears, setRestYears] = useState(5);

  // Discount Rate (Initial Placement Rate)
  const [discountRate, setDiscountRate] = useState(15);

  const calculateNPV = (nominal: number, rate: number, freq: number, years: number, discRate: number) => {
    let npv = 0;
    const periods = years * freq;
    const couponPayment = (nominal * (rate / 100)) / freq;
    const periodDiscRate = discRate / 100 / freq; // simplified period rate

    for (let i = 1; i <= periods; i++) {
      let cashFlow = couponPayment;
      if (i === periods) cashFlow += nominal; // Principal at end
      npv += cashFlow / Math.pow(1 + periodDiscRate, i);
    }
    return Math.round(npv);
  };

  const npvInitial = useMemo(() => calculateNPV(initNominal, initRate, initFreq, initYears, discountRate), 
    [initNominal, initRate, initFreq, initYears, discountRate]);
  
  const npvRestruct = useMemo(() => calculateNPV(restNominal, restRate, restFreq, restYears, discountRate), 
    [restNominal, restRate, restFreq, restYears, discountRate]);

  const chartData = [
    { name: 'Первоначальные условия', NPV: npvInitial, fill: '#1a1a1a' },
    { name: 'Реструктуризация', NPV: npvRestruct, fill: '#bfa17a' },
  ];

  const diff = npvRestruct - npvInitial;
  const diffPercent = ((diff / npvInitial) * 100).toFixed(1);

  return (
    <div className="space-y-12">
      <div className="p-4 bg-gray-50 rounded border border-gray-100">
         <InputField 
            label="Ставка дисконтирования (% годовых при размещении)" 
            value={discountRate} 
            onChange={(v: string) => setDiscountRate(Number(v))} 
         />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Initial Conditions */}
        <div className="p-6 border border-gray-200 bg-white">
          <h3 className="font-serif text-lg mb-4 text-primary border-b pb-2">1. Первоначальные условия</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Номинал (RUB)" value={initNominal} onChange={(v: string) => setInitNominal(Number(v))} />
            <InputField label="Срок (лет)" value={initYears} onChange={(v: string) => setInitYears(Number(v))} />
            <InputField label="Купон (%)" value={initRate} onChange={(v: string) => setInitRate(Number(v))} />
            <SelectField label="Выплат в год" value={initFreq} onChange={(v: string) => setInitFreq(Number(v))} options={[2, 4, 12]} />
          </div>
        </div>

        {/* Restructuring Conditions */}
        <div className="p-6 border border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg mb-4 text-accent-dark border-b border-accent/20 pb-2">2. Условия реструктуризации</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Номинал (RUB)" value={restNominal} onChange={(v: string) => setRestNominal(Number(v))} />
            <InputField label="Срок (лет)" value={restYears} onChange={(v: string) => setRestYears(Number(v))} />
            <InputField label="Купон (%)" value={restRate} onChange={(v: string) => setRestRate(Number(v))} />
            <SelectField label="Выплат в год" value={restFreq} onChange={(v: string) => setRestFreq(Number(v))} options={[2, 4, 12]} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10, fontFamily: 'Manrope'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontFamily: 'Manrope'}} />
                <Bar dataKey="NPV" barSize={30} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#666', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="bg-primary text-white p-8">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Результат сравнения (NPV)</h4>
            <div className="flex justify-between items-end border-b border-gray-700 pb-4 mb-4">
                <span>Текущие условия:</span>
                <span className="text-xl font-serif">{npvInitial.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between items-end">
                <span>Реструктуризация:</span>
                <span className={`text-2xl font-serif ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {npvRestruct.toLocaleString()} ₽
                </span>
            </div>
            <div className="mt-6 text-sm text-gray-400">
                Разница: <span className={diff >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {diff > 0 ? '+' : ''}{diff.toLocaleString()} ₽ ({diffPercent}%)
                </span>
            </div>
        </div>
      </div>

      <div className="text-center border-t border-gray-100 pt-6">
        <p className="text-xs text-gray-400 italic">
            * Дисклеймер: Не является инвестиционной рекомендацией. Все расчеты предварительные и не учитывают точных параметров реструктуризации.
        </p>
      </div>
    </div>
  );
};
