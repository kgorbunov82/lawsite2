import React, { useState, useEffect } from 'react';
import { getContent, addLead, getArticles } from './services/storage';
import { SiteContent, Article } from './types';
import { Calculators } from './components/Calculators';
import { AdminDashboard } from './pages/AdminDashboard';
import { Menu, X, ArrowRight, CheckCircle2, Phone, Mail, MapPin, Scale, ChevronRight, ChevronDown, ChevronUp, FileText, Clock, AlertTriangle, Gavel, Users, ShieldAlert, Send } from 'lucide-react';

type Page = 'about' | 'practice' | 'expertise' | 'articles' | 'tools' | 'contact';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'public' | 'login' | 'admin'>('public');

  // Simple Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAdmin(true);
      setView('admin');
    } else {
      alert('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView('public');
    setPassword('');
  };

  if (view === 'admin' && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form onSubmit={handleLogin} className="bg-white p-10 shadow-2xl rounded-sm w-96 border-t-4 border-accent">
          <h2 className="text-2xl font-serif text-center mb-6">Вход в систему</h2>
          <input
            type="password"
            className="w-full border-b border-gray-300 p-2 mb-6 focus:outline-none focus:border-accent font-serif text-xl text-center"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-primary text-white py-3 hover:bg-black transition-colors uppercase tracking-widest text-xs">
            Войти
          </button>
          <button type="button" onClick={() => setView('public')} className="w-full mt-4 text-xs text-gray-400 hover:text-primary">
            Вернуться на сайт
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <PublicSite onAdminClick={() => setView('login')} />
    </>
  );
}

const PublicSite: React.FC<{ onAdminClick: () => void }> = ({ onAdminClick }) => {
  const [content, setContent] = useState<SiteContent>(getContent());
  const [currentPage, setCurrentPage] = useState<Page>('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Reload content on mount to catch CMS updates
  useEffect(() => {
    setContent(getContent());
  }, []);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div 
            className="font-serif text-2xl font-bold tracking-tight cursor-pointer hover:text-accent-dark transition-colors"
            onClick={() => navigate('about')}
          >
            {content.logoText}
          </div>
          
          <div className="hidden md:flex space-x-8 text-xs font-semibold tracking-widest uppercase text-gray-500">
            <button onClick={() => navigate('about')} className={`hover:text-accent-dark transition-colors ${currentPage === 'about' ? 'text-accent-dark' : ''}`}>Обо мне</button>
            <button onClick={() => navigate('expertise')} className={`hover:text-accent-dark transition-colors ${currentPage === 'expertise' ? 'text-accent-dark' : ''}`}>Экспертиза</button>
            <button onClick={() => navigate('practice')} className={`hover:text-accent-dark transition-colors ${currentPage === 'practice' ? 'text-accent-dark' : ''}`}>Практика</button>
            <button onClick={() => navigate('articles')} className={`hover:text-accent-dark transition-colors ${currentPage === 'articles' ? 'text-accent-dark' : ''}`}>Статьи</button>
            <button onClick={() => navigate('tools')} className={`hover:text-accent-dark transition-colors ${currentPage === 'tools' ? 'text-accent-dark' : ''}`}>Инструменты</button>
            <button onClick={() => navigate('contact')} className={`hover:text-accent-dark transition-colors ${currentPage === 'contact' ? 'text-accent-dark' : ''}`}>Контакты</button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-background flex flex-col items-center justify-center space-y-8 text-xl font-serif animate-fade-in">
             <button onClick={() => navigate('about')}>Обо мне</button>
             <button onClick={() => navigate('expertise')}>Экспертиза</button>
             <button onClick={() => navigate('practice')}>Практика</button>
             <button onClick={() => navigate('articles')}>Статьи</button>
             <button onClick={() => navigate('tools')}>Инструменты</button>
             <button onClick={() => navigate('contact')}>Контакты</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        {currentPage === 'about' && <HomePage content={content} onNavigate={navigate} />}
        {currentPage === 'practice' && <PracticePage />}
        {currentPage === 'expertise' && <ExpertisePage content={content} />}
        {currentPage === 'articles' && <ArticlesPage />}
        {currentPage === 'tools' && <ToolsPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                  <p>© {new Date().getFullYear()} Адвокат Горбунов К.Э. Все права защищены.</p>
                  <p className="text-xs mt-1">МСКА «Экзитум», филиал г. Калининград</p>
              </div>
              <button onClick={onAdminClick} className="hover:text-primary transition-colors text-xs uppercase tracking-widest mt-4 md:mt-0">
                  Вход для сотрудников
              </button>
          </div>
      </footer>
    </div>
  );
};

// --- Page Components ---

const HomePage: React.FC<{ content: SiteContent, onNavigate: (p: Page) => void }> = ({ content, onNavigate }) => {
  const paragraphs = content.aboutText.split('\n').filter(p => p.trim() !== '');

  return (
    <>
      {/* Hero Section */}
      <header className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 opacity-[0.05]" 
             style={{backgroundImage: `url("${content.heroImage}")`, backgroundSize: 'cover', backgroundPosition: 'center'}} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent z-0"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto animate-slide-up">
          <p className="text-accent-dark font-medium italic text-lg tracking-widest mb-6">Адвокат Горбунов К.Э.</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 leading-[1.1] text-primary">
            {content.heroTitle}
          </h1>
          <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl text-gray-600 font-serif italic max-w-3xl mx-auto leading-relaxed">
            "{content.heroSubtitle}"
          </p>
          <div className="mt-12">
            <button onClick={() => onNavigate('contact')} className="inline-block px-10 py-4 border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 uppercase text-xs tracking-[0.2em] font-medium">
              Получить защиту
            </button>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-24 container mx-auto px-6 bg-white">
        <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-16">
              <span className="text-accent-dark text-xs tracking-widest uppercase mb-4 block">Об Адвокате</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary">Адвокат Горбунов Константин</h2>
            </div>
            
            <div className="grid md:grid-cols-12 gap-12 items-start">
               {/* Image Column */}
               <div className="md:col-span-5 relative">
                  <div className="aspect-[3/4] w-full relative z-10">
                    <img 
                      src={content.profileImage} 
                      alt="Адвокат Горбунов Константин" 
                      className="w-full h-full object-cover shadow-lg" 
                    />
                    <div className="absolute top-4 -left-4 w-full h-full border border-accent/20 -z-10 hidden md:block"></div>
                  </div>
               </div>

               {/* Text Column */}
               <div className="md:col-span-7">
                  <div className="text-gray-700 leading-8 font-light text-lg text-justify font-sans">
                    {paragraphs.map((paragraph, index) => (
                      <p key={index} className="mb-6 indent-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-100 mt-8">
                      <div>
                          <h4 className="font-serif text-xl mb-3 italic">Образование</h4>
                          <p className="text-gray-500 text-sm leading-relaxed">{content.education}</p>
                      </div>
                      <div>
                          <h4 className="font-serif text-xl mb-3 italic">Статус</h4>
                          <p className="text-gray-500 text-sm leading-relaxed">{content.status}</p>
                      </div>
                  </div>
               </div>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-surface border-y border-gray-100">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="group">
                <span className="block text-5xl font-serif text-accent-dark mb-2 group-hover:scale-110 transition-transform duration-500">{content.statsExperience}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Лет опыта</span>
            </div>
            <div className="group">
                <span className="block text-5xl font-serif text-accent-dark mb-2 group-hover:scale-110 transition-transform duration-500">{content.statsRecovered}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Взыскано активов</span>
            </div>
            <div className="group">
                <span className="block text-5xl font-serif text-accent-dark mb-2 group-hover:scale-110 transition-transform duration-500">РФ+</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">География</span>
            </div>
            <div className="group">
                <span className="block text-5xl font-serif text-accent-dark mb-2 group-hover:scale-110 transition-transform duration-500">24/7</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Связь</span>
            </div>
        </div>
      </section>

      {/* Tools Section (Added to Home) */}
      <section className="py-24 container mx-auto px-6 bg-white">
        <div className="text-center mb-12">
            <span className="text-accent-dark text-xs tracking-widest uppercase mb-4 block">Инструменты оценки судебного спора</span>
            <h2 className="text-4xl font-serif">Калькуляторы</h2>
        </div>
        <div className="max-w-5xl mx-auto">
          <Calculators />
        </div>
      </section>

      {/* Contacts Section (Bottom of Home Page) */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16">
                <div className="animate-fade-in">
                    <span className="text-accent text-xs tracking-widest uppercase mb-4 block">Контакты</span>
                    <h2 className="text-4xl font-serif mb-8">Начните с консультации</h2>
                    
                    <div className="space-y-10">
                        <div className="flex items-start space-x-6 group">
                            <Phone className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                            <div>
                                <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Телефон</span>
                                <span className="font-serif text-2xl">+7 (909) 776-88-59</span>
                            </div>
                        </div>
                        <div className="flex items-start space-x-6 group">
                             <Send className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                             <div>
                                 <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Telegram Канал</span>
                                 <a href="https://t.me/gorbunov_legal" target="_blank" rel="noopener noreferrer" className="font-serif text-2xl hover:text-accent transition-colors border-b border-transparent hover:border-accent">
                                     @gorbunov_legal
                                 </a>
                             </div>
                        </div>
                        <div className="flex items-start space-x-6 group">
                            <Mail className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                            <div>
                                <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email</span>
                                <a href="mailto:kgorbunov@exitumlaw.ru" className="font-serif text-2xl hover:text-accent transition-colors border-b border-transparent hover:border-accent">
                                    kgorbunov@exitumlaw.ru
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start space-x-6 group">
                            <MapPin className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                            <div>
                                <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Офис</span>
                                <span className="font-serif text-xl leading-relaxed">
                                г. Калининград, ул. Октябрьская, д. 8, оф. 502<br/>
                                <span className="text-gray-500 text-base italic">(САР Остров Октябрьский)</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-10 md:p-12 text-primary rounded-sm shadow-2xl">
                    <ContactForm />
                </div>
            </div>
        </div>
      </section>
    </>
  );
};

const PracticePage: React.FC = () => {
  const practices = [
    { title: "Сопровождение споров", desc: "Комплексная защита в арбитражных судах всех инстанций. Корпоративные, коммерческие и административные споры." },
    { title: "Сопровождение процедур банкротства", desc: "Включение в реестр кредиторов, оспаривание сделок, субсидиарная ответственность, контроль за действиями арбитражного управляющего." },
    { title: "ДД проектов и сделок", desc: "Due Diligence: глубокий анализ юридических рисков перед покупкой активов, входом в проект или заключением крупных сделок." },
    { title: "Юридическое инвестирование", desc: "Финансирование судебных процессов в обмен на процент от взысканной суммы (Litigation Funding). Вы платите только за результат." },
    { title: "Консультации", desc: "Устные и письменные правовые заключения по сложным вопросам корпоративного права и защиты активов." },
  ];

  return (
    <div className="py-24 container mx-auto px-6 animate-fade-in">
       <div className="text-center mb-16">
          <span className="text-accent-dark text-xs tracking-widest uppercase mb-4 block">Ключевые компетенции</span>
          <h2 className="text-4xl font-serif">Практика</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {practices.map((p, idx) => (
          <div key={idx} className="bg-white p-10 border border-gray-100 hover:border-accent hover:shadow-xl transition-all duration-500 group">
             <Scale className="text-gray-300 mb-6 group-hover:text-accent-dark transition-colors" size={32} />
             <h3 className="text-2xl font-serif mb-4 group-hover:text-primary transition-colors">{p.title}</h3>
             <p className="text-gray-600 font-light leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpertisePage: React.FC<{ content: SiteContent }> = ({ content }) => {
  return (
    <div className="py-24 container mx-auto px-6 animate-fade-in bg-white">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-accent-dark text-xs tracking-widest uppercase mb-4 block">Опыт и знания</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-8">Экспертиза</h1>
            <h2 className="text-2xl font-serif italic text-gray-600 mb-8">"В праве нет мелочей"</h2>
            <p className="text-lg text-gray-700 font-light leading-relaxed mb-6">
                Моя юридическая практика основана на глубоком анализе фактов и точности правовых решений. Я представляю интересы бизнеса и инвесторов в сложных ситуациях, связанных с корпоративными конфликтами, банкротством и нарушением обязательств по облигациям.
            </p>
            <p className="text-lg text-gray-700 font-light leading-relaxed">
                Работаю там, где требуются стратегическое мышление, понимание финансовых инструментов и способность выстраивать эффективные механизмы защиты.
            </p>
        </div>

        {/* Main Practice Areas Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Corporate Disputes */}
            <div className="bg-surface p-8 border border-gray-100 hover:border-accent transition-colors duration-300 group">
                <div className="mb-6">
                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent-dark transition-colors uppercase mb-2">Корпоративные споры</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Основное направление практики</p>
                </div>
                <p className="text-gray-600 font-light mb-6 text-sm leading-relaxed">
                    Как <strong className="font-medium text-gray-900">адвокат по корпоративным спорам</strong> я сопровождаю бизнес в конфликтных ситуациях, связанных с управлением, распределением долей и действиями руководства.
                </p>
                <ul className="space-y-3">
                    {[
                        "Корпоративные конфликты между участниками и акционерами",
                        "Споры о распределении долей и реальном контроле",
                        "Оспаривание корпоративных действий и сделок",
                        "Защита миноритарных акционеров",
                        "Споры внутри группы компаний",
                        "Расследование недобросовестных действий руководства"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-light">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-relaxed">
                      SEO: корпоративный юрист, защита акционеров, юрист по корпоративным делам
                   </p>
                </div>
            </div>

            {/* Bankruptcy */}
            <div className="bg-surface p-8 border border-gray-100 hover:border-accent transition-colors duration-300 group">
                 <div className="mb-6">
                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent-dark transition-colors uppercase mb-2">Банкротство</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Защита кредиторов и возврат активов</p>
                </div>
                <p className="text-gray-600 font-light mb-6 text-sm leading-relaxed">
                    Как <strong className="font-medium text-gray-900">юрист по банкротству</strong> я представляю кредиторов в наиболее сложных процедурах, где важна скорость и доказательственная база.
                </p>
                <ul className="space-y-3">
                    {[
                        "Включение требований в реестр",
                        "Оспаривание сделок должника",
                        "Привлечение к субсидиарной ответственности",
                        "Споры с арбитражными управляющими",
                        "Возврат активов через судебные механизмы",
                        "Анализ финансовых потоков и структуры"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-light">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                 <div className="mt-8 pt-6 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-relaxed">
                      SEO: адвокат по банкротству, субсидиарная ответственность, оспаривание сделок
                   </p>
                </div>
            </div>

            {/* Bond Disputes */}
            <div className="bg-surface p-8 border border-gray-100 hover:border-accent transition-colors duration-300 group">
                 <div className="mb-6">
                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent-dark transition-colors uppercase mb-2">Облигационные споры</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Защита прав инвесторов при дефолте</p>
                </div>
                <p className="text-gray-600 font-light mb-6 text-sm leading-relaxed">
                    <strong className="font-medium text-gray-900">Облигационные споры</strong> — одна из самых узких специализаций. Представляю инвесторов, когда эмитент нарушает обязательства.
                </p>
                <ul className="space-y-3">
                    {[
                        "Защита прав инвесторов при дефолте эмитента",
                        "Споры о досрочном погашении облигаций",
                        "Нарушения эмитента и депозитария",
                        "Анализ корпоративных действий (CA)",
                        "Реструктуризации и права держателей",
                        "Судебная защита прав инвесторов",
                        "Споры с иностранным элементом"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-light">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                 <div className="mt-8 pt-6 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-relaxed">
                      SEO: адвокат по облигациям, дефолт эмитента, защита прав инвесторов
                   </p>
                </div>
            </div>
        </div>

        {/* Why Choose Me */}
        <div className="bg-primary text-white p-12 rounded-sm">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-serif mb-8 text-center">Почему клиенты обращаются ко мне</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 flex items-center justify-center border border-accent/30 rounded-full flex-shrink-0 text-accent font-serif text-xl">1</div>
                        <div>
                            <h4 className="font-bold mb-2 text-accent">Глубокая специализация</h4>
                            <p className="text-gray-400 text-sm font-light">Уникальный опыт в корпоративных спорах, банкротстве и облигационных делах.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                         <div className="w-12 h-12 flex items-center justify-center border border-accent/30 rounded-full flex-shrink-0 text-accent font-serif text-xl">2</div>
                        <div>
                            <h4 className="font-bold mb-2 text-accent">Стратегический подход</h4>
                            <p className="text-gray-400 text-sm font-light">Работа на стыке права, финансов и экономических связей.</p>
                        </div>
                    </div>
                     <div className="flex gap-4">
                         <div className="w-12 h-12 flex items-center justify-center border border-accent/30 rounded-full flex-shrink-0 text-accent font-serif text-xl">3</div>
                        <div>
                            <h4 className="font-bold mb-2 text-accent">Фокус на результат</h4>
                            <p className="text-gray-400 text-sm font-light">Защита активов и законных интересов клиента как главный приоритет.</p>
                        </div>
                    </div>
                     <div className="flex gap-4">
                         <div className="w-12 h-12 flex items-center justify-center border border-accent/30 rounded-full flex-shrink-0 text-accent font-serif text-xl">4</div>
                        <div>
                            <h4 className="font-bold mb-2 text-accent">Практические механизмы</h4>
                            <p className="text-gray-400 text-sm font-light">Решения, которые приводят к реальному возврату стоимости.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Bond Timeline Special Component ---
const BondTimelineView: React.FC<{ article: Article }> = ({ article }) => {
    const events = [
        { 
            day: "День X", 
            title: "Наступает дата выплаты", 
            actor: "Эмитент",
            desc: "Дата выплаты купона, номинала или оферты. Если деньги не поступили — начинается отсчет.",
            icon: <Clock size={20} />
        },
        { 
            day: "День 1-10", 
            title: "Технический дефолт", 
            actor: "Эмитент",
            desc: "Эмитент имеет 10 рабочих дней на устранение просрочки (ст. 17.1 п. 5 ФЗ № 39). Инвестор наблюдает.",
            icon: <AlertTriangle size={20} className="text-yellow-500" />
        },
        { 
            day: "День 10", 
            title: "Право на досрочное погашение", 
            actor: "Инвестор",
            desc: "Просрочка свыше 10 дней — существенное нарушение. Возникает право требовать возврата номинала + НКД.",
            icon: <CheckCircle2 size={20} className="text-green-600" />
        },
        { 
            day: "День 17", 
            title: "Юридический дефолт", 
            actor: "Эмитент / ПВО",
            desc: "7 дней на исполнение требований истекли. Дефолт состоялся. Эмитент обязан был выкупить бумаги.",
            icon: <ShieldAlert size={20} className="text-red-600" />
        },
        { 
            day: "День 30", 
            title: "Право на самостоятельный иск", 
            actor: "Инвестор",
            desc: "Если ПВО бездействует месяц, владельцы получают право подать иск самостоятельно (ст. 29.7 п. 16).",
            icon: <Scale size={20} />
        },
        { 
            day: "День 45", 
            title: "Крайний срок для ОСВО", 
            actor: "ПВО",
            desc: "Представитель владельцев облигаций обязан созвать Общее собрание.",
            icon: <Users size={20} />
        },
        { 
            day: "День 60-90", 
            title: "Судебная стадия", 
            actor: "Суд",
            desc: "Активная фаза: подача коллективных или индивидуальных исков. Арест счетов и имущества.",
            icon: <Gavel size={20} />
        },
    ];

    return (
        <div className="animate-fade-in pb-12">
            {/* Header Image */}
            <div className="w-full h-80 md:h-96 relative overflow-hidden mb-12">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
                    <div className="max-w-4xl text-center">
                        <h1 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight">{article.title}</h1>
                        <p className="text-white/80 font-serif italic text-lg">Дорожная карта инвестора</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6">
                {/* Intro Text */}
                <div className="prose prose-lg text-gray-700 font-light mb-16 leading-relaxed">
                    <p className="text-xl italic text-gray-900 border-l-4 border-accent pl-4 mb-8">
                        Когда эмитент перестаёт платить по облигациям, у инвестора есть не только повод для беспокойства, но и чёткий юридический алгоритм действий.
                    </p>
                    <p>
                        Разобраться в сроках — значит понять, когда дефолт считается состоявшимся, когда должен действовать представитель владельцев облигаций (ПВО), и с какого дня инвестор вправе обращаться в суд самостоятельно.
                    </p>
                    <h3 className="text-2xl font-serif text-primary mt-8 mb-4">🔹 Что такое дефолт по облигациям</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Технический дефолт</strong> — короткая просрочка, которую эмитент может устранить самостоятельно.</li>
                        <li><strong>Юридический дефолт</strong> — полное неисполнение обязательств, дающее инвестору право на судебную защиту.</li>
                    </ul>
                </div>

                {/* Timeline Visualization */}
                <div className="relative border-l-2 border-accent/30 ml-4 md:ml-6 space-y-12 mb-20">
                    {events.map((event, idx) => (
                        <div key={idx} className="relative pl-8 md:pl-12 group">
                            {/* Dot */}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-background border-2 border-accent rounded-full group-hover:bg-accent transition-colors"></div>
                            
                            {/* Content */}
                            <div className="flex flex-col md:flex-row md:items-start gap-4 animate-slide-up" style={{animationDelay: `${idx * 100}ms`}}>
                                <div className="min-w-[120px]">
                                    <span className="text-accent-dark font-bold font-serif text-lg">{event.day}</span>
                                    <span className="block text-xs uppercase text-gray-400 tracking-widest mt-1">{event.actor}</span>
                                </div>
                                <div className="bg-surface p-6 rounded-sm border border-gray-100 flex-1 hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-accent-dark">{event.icon}</div>
                                        <h4 className="font-bold text-primary">{event.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 font-light leading-relaxed">{event.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analysis / Outro */}
                <div className="bg-primary text-white p-8 md:p-12 rounded-sm mb-12">
                    <h3 className="text-2xl font-serif mb-6 text-accent">💡 Главные точки контроля</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-sm font-light text-gray-300">
                        <div className="flex items-center gap-3">
                            <span className="text-accent font-bold text-xl">10</span>
                            <p>дней на устранение технического дефолта.</p>
                        </div>
                         <div className="flex items-center gap-3">
                            <span className="text-accent font-bold text-xl">17</span>
                            <p>дней — момент истины. Дефолт состоялся.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-accent font-bold text-xl">30</span>
                            <p>дней — право на самостоятельный иск.</p>
                        </div>
                         <div className="flex items-center gap-3">
                            <span className="text-accent font-bold text-xl">45</span>
                            <p>дней — крайний срок для собрания (ОСВО).</p>
                        </div>
                    </div>
                </div>

                <div className="prose prose-lg text-gray-700 font-light">
                     <h3 className="text-2xl font-serif text-primary mb-4">⚖️ Роль ПВО и право инвестора</h3>
                     <p>
                        ПВО обязан зафиксировать дефолт, раскрыть сообщение и созвать ОСВО в течение 45 дней. 
                        Однако, <strong>инвестор не должен ждать бесконечно</strong>.
                        Если в течение одного месяца с момента дефолта ПВО не подал иск, владельцы облигаций вправе в индивидуальном порядке обратиться в суд.
                     </p>
                     <p className="mt-8 text-sm text-gray-400 border-t pt-4">
                        SEO: дефолт по облигациям, технический дефолт, юридический дефолт, ПВО, ОСВО, взыскание долга по облигациям, действия инвестора при дефолте.
                     </p>
                </div>
            </div>
        </div>
    );
}

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setArticles(getArticles());
  }, []);

  const toggleArticle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="py-24 container mx-auto px-6 animate-fade-in bg-background">
      <div className="text-center mb-16">
          <span className="text-accent-dark text-xs tracking-widest uppercase mb-4 block">Блог</span>
          <h2 className="text-4xl font-serif">Статьи и Публикации</h2>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
             {/* Special rendering for Timeline article when open */}
             {openId === article.id && article.id === 'bond-timeline-2025' ? (
                <>
                   <button 
                      onClick={() => toggleArticle(article.id)}
                      className="w-full text-right p-4 text-gray-400 hover:text-primary transition-colors flex justify-end items-center gap-2 text-xs uppercase tracking-widest"
                    >
                      Свернуть <ChevronUp size={16}/>
                   </button>
                   <BondTimelineView article={article} />
                </>
             ) : (
                // Standard View
                <>
                    <button 
                    onClick={() => toggleArticle(article.id)}
                    className="w-full text-left p-8 flex justify-between items-start hover:bg-gray-50 transition-colors"
                    >
                    <div>
                        <span className="text-xs text-accent-dark uppercase tracking-widest mb-2 block">
                        {new Date(article.date).toLocaleDateString()}
                        </span>
                        <h3 className="text-xl font-serif font-medium text-primary">{article.title}</h3>
                        {!openId && <p className="text-gray-500 mt-2 font-light text-sm line-clamp-2">{article.excerpt}</p>}
                    </div>
                    <div className="mt-2 text-gray-400">
                        {openId === article.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    </button>
                    
                    {openId === article.id && (
                    <div className="px-8 pb-8 pt-0 prose prose-stone max-w-none text-gray-700 font-light leading-relaxed whitespace-pre-line animate-fade-in">
                        {article.image && (
                        <div className="mb-8 w-full h-64 overflow-hidden rounded-sm">
                            <img src={article.image} alt={article.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                        </div>
                        )}
                        <div className="h-px w-full bg-gray-100 mb-6"></div>
                        {article.content}
                    </div>
                    )}
                </>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ToolsPage: React.FC = () => {
  return (
    <div className="py-24 bg-background min-h-screen">
       <div className="container mx-auto px-6">
            <div className="text-center mb-12 animate-fade-in">
                <span className="text-accent-dark text-xs tracking-widest uppercase mb-4 block">Финансовые Инструменты</span>
                <h2 className="text-4xl font-serif">Калькуляторы Инвестора</h2>
                <p className="text-gray-500 mt-4 font-light max-w-2xl mx-auto">
                   Инструменты для предварительной оценки судебных издержек и анализа эффективности реструктуризации долговых обязательств.
                </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <Calculators />
            </div>
       </div>
    </div>
  );
};

const ContactPage: React.FC = () => {
    return (
        <div className="py-24 bg-primary text-white min-h-[calc(100vh-80px)]">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16">
                    <div className="animate-fade-in">
                        <span className="text-accent text-xs tracking-widest uppercase mb-4 block">Контакты</span>
                        <h2 className="text-4xl font-serif mb-8">Начните с консультации</h2>
                        
                        <div className="space-y-10">
                            <div className="flex items-start space-x-6 group">
                                <Phone className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Телефон</span>
                                    <span className="font-serif text-2xl">+7 (909) 776-88-59</span>
                                </div>
                            </div>
                            <div className="flex items-start space-x-6 group">
                                <Send className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Telegram Канал</span>
                                    <a href="https://t.me/gorbunov_legal" target="_blank" rel="noopener noreferrer" className="font-serif text-2xl hover:text-accent transition-colors border-b border-transparent hover:border-accent">
                                        @gorbunov_legal
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start space-x-6 group">
                                <Mail className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email</span>
                                    <a href="mailto:kgorbunov@exitumlaw.ru" className="font-serif text-2xl hover:text-accent transition-colors border-b border-transparent hover:border-accent">
                                        kgorbunov@exitumlaw.ru
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start space-x-6 group">
                                <MapPin className="text-accent mt-1 group-hover:text-white transition-colors" size={24} />
                                <div>
                                    <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Офис</span>
                                    <span className="font-serif text-xl leading-relaxed">
                                    г. Калининград, ул. Октябрьская, д. 8, оф. 502<br/>
                                    <span className="text-gray-500 text-base italic">(САР Остров Октябрьский)</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-10 md:p-12 text-primary rounded-sm shadow-2xl animate-slide-up">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', issue: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addLead(formData, 'form');
        setSubmitted(true);
        setFormData({ name: '', phone: '', issue: '' });
        setTimeout(() => setSubmitted(false), 5000);
    };

    if (submitted) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                <CheckCircle2 size={64} className="text-accent-dark" />
                <h3 className="text-2xl font-serif">Заявка принята</h3>
                <p className="text-gray-500">Мы свяжемся с вами в ближайшее время.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-serif mb-6">Связаться с нами</h3>
            <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Ваше Имя</label>
                <input 
                    required
                    type="text" 
                    className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-accent-dark transition-colors font-serif text-lg"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Телефон</label>
                <input 
                    required
                    type="tel" 
                    className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-accent-dark transition-colors font-serif text-lg"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Кратко о ситуации</label>
                <textarea 
                    rows={3}
                    className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-accent-dark transition-colors resize-none font-serif text-lg"
                    value={formData.issue}
                    onChange={e => setFormData({...formData, issue: e.target.value})}
                />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-4 mt-4 hover:bg-accent-dark transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                Отправить заявку <ArrowRight size={16} />
            </button>
        </form>
    );
};