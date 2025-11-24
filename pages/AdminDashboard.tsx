import React, { useState, useEffect } from 'react';
import { 
  getLeads, updateLeadStatus, deleteLead, 
  getContent, saveContent, 
  getArticles, saveArticle, deleteArticle, 
  exportData, importData
} from '../services/storage';
import { Lead, LeadStatus, SiteContent, Article } from '../types';
import { Trash2, Edit, Save, Download, Upload, LogOut, CheckCircle, Clock, Archive, Image as ImageIcon, AlertTriangle } from 'lucide-react';

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [tab, setTab] = useState<'crm' | 'cms' | 'blog' | 'backup'>('crm');
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-primary text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-serif text-xl">Admin Panel <span className="text-accent">.</span></h1>
        <div className="flex gap-4 items-center">
            <div className="flex space-x-1 text-sm">
                <button onClick={() => setTab('crm')} className={`px-4 py-2 rounded transition-colors ${tab === 'crm' ? 'bg-accent text-primary' : 'hover:bg-gray-800'}`}>CRM</button>
                <button onClick={() => setTab('cms')} className={`px-4 py-2 rounded transition-colors ${tab === 'cms' ? 'bg-accent text-primary' : 'hover:bg-gray-800'}`}>Контент</button>
                <button onClick={() => setTab('blog')} className={`px-4 py-2 rounded transition-colors ${tab === 'blog' ? 'bg-accent text-primary' : 'hover:bg-gray-800'}`}>Блог</button>
                <button onClick={() => setTab('backup')} className={`px-4 py-2 rounded transition-colors ${tab === 'backup' ? 'bg-accent text-primary' : 'hover:bg-gray-800'}`}>Backup</button>
            </div>
            <button onClick={onLogout} className="text-gray-400 hover:text-white ml-4"><LogOut size={18} /></button>
        </div>
      </nav>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            {tab === 'crm' && <CRMTab />}
            {tab === 'cms' && <CMSTab />}
            {tab === 'blog' && <BlogTab />}
            {tab === 'backup' && <BackupTab />}
        </div>
      </main>
    </div>
  );
};

const CRMTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateLeadStatus(id, status);
    setLeads(getLeads());
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить лид?')) {
        deleteLead(id);
        setLeads(getLeads());
    }
  };

  const statusColors = {
    [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
    [LeadStatus.ANALYSIS]: 'bg-yellow-100 text-yellow-800',
    [LeadStatus.WON]: 'bg-green-100 text-green-800',
    [LeadStatus.LOST]: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-serif">Заявки (Leads)</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                    <tr>
                        <th className="p-4">Имя</th>
                        <th className="p-4">Телефон</th>
                        <th className="p-4">Проблема</th>
                        <th className="p-4">Источник</th>
                        <th className="p-4">Статус</th>
                        <th className="p-4">Действия</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors text-sm">
                            <td className="p-4 font-medium">{lead.name}</td>
                            <td className="p-4">{lead.phone}</td>
                            <td className="p-4 text-gray-600 max-w-xs truncate" title={lead.issue}>{lead.issue}</td>
                            <td className="p-4 text-xs text-gray-400">{lead.source}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[lead.status]}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    <button onClick={() => handleStatusChange(lead.id, LeadStatus.ANALYSIS)} title="В анализ"><Clock size={16} className="text-yellow-600"/></button>
                                    <button onClick={() => handleStatusChange(lead.id, LeadStatus.WON)} title="В работу"><CheckCircle size={16} className="text-green-600"/></button>
                                    <button onClick={() => handleStatusChange(lead.id, LeadStatus.LOST)} title="В архив"><Archive size={16} className="text-gray-400"/></button>
                                    <button onClick={() => handleDelete(lead.id)} title="Удалить"><Trash2 size={16} className="text-red-400"/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {leads.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Нет активных заявок</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
};

const CMSTab: React.FC = () => {
    const [content, setContent] = useState<SiteContent>(getContent());
    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (field: keyof SiteContent, value: any) => {
        setContent(prev => ({ ...prev, [field]: value }));
        setIsSaved(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteContent) => {
        const file = e.target.files?.[0];
        if (file) {
             // 500KB limit to be safe with LocalStorage (which is usually 5MB total)
             if (file.size > 500 * 1024) {
                alert("Файл слишком большой (>500КБ). Локальное хранилище браузера ограничено. Пожалуйста, сожмите фото или используйте внешнюю ссылку.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const success = saveContent(content);
        if (success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } else {
            alert("Ошибка сохранения! Вероятно, общий размер данных превысил лимит памяти браузера (5MB). Попробуйте использовать ссылки на фото вместо загрузки файлов.");
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-serif">Текстовый контент</h2>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Текст Логотипа</label>
                        <input type="text" className="w-full border p-2 rounded" value={content.logoText} onChange={(e) => handleChange('logoText', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Главный заголовок</label>
                        <input type="text" className="w-full border p-2 rounded font-serif text-xl" value={content.heroTitle} onChange={(e) => handleChange('heroTitle', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Подзаголовок</label>
                        <input type="text" className="w-full border p-2 rounded" value={content.heroSubtitle} onChange={(e) => handleChange('heroSubtitle', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Опыт</label>
                            <input type="text" className="w-full border p-2 rounded" value={content.statsExperience} onChange={(e) => handleChange('statsExperience', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Взыскано</label>
                            <input type="text" className="w-full border p-2 rounded" value={content.statsRecovered} onChange={(e) => handleChange('statsRecovered', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Образование</label>
                        <input type="text" className="w-full border p-2 rounded" value={content.education || ''} onChange={(e) => handleChange('education', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Статус / Должность</label>
                        <input type="text" className="w-full border p-2 rounded" value={content.status || ''} onChange={(e) => handleChange('status', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Текст "О нас"</label>
                        <textarea rows={6} className="w-full border p-2 rounded" value={content.aboutText} onChange={(e) => handleChange('aboutText', e.target.value)} />
                    </div>
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Текст "Экспертиза"</label>
                        <textarea rows={6} className="w-full border p-2 rounded" value={content.expertiseText} onChange={(e) => handleChange('expertiseText', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                     <h2 className="text-2xl font-serif">Графика</h2>
                     <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-black transition-colors">
                        <Save size={16} /> {isSaved ? 'Сохранено' : 'Сохранить'}
                    </button>
                </div>
                
                <div className="bg-yellow-50 p-4 border border-yellow-200 rounded text-sm text-yellow-800 flex gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-1" />
                    <p>Для лучшей работы сайта используйте прямые ссылки на изображения. Если загружаете файлы, их размер должен быть меньше 500КБ.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2"><ImageIcon size={14}/> Фон главного экрана (URL или Файл)</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" className="flex-1 border p-2 rounded text-sm" value={content.heroImage} onChange={(e) => handleChange('heroImage', e.target.value)} placeholder="https://..." />
                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors flex items-center justify-center border border-gray-200" title="Загрузить файл">
                                <Upload size={20} className="text-gray-600"/>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} />
                            </label>
                        </div>
                        {content.heroImage && <div className="h-24 w-full bg-cover bg-center rounded" style={{backgroundImage: `url(${content.heroImage})`}}></div>}
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2"><ImageIcon size={14}/> Фото профиля (URL или Файл)</label>
                        <div className="flex gap-2 mb-2">
                             <input type="text" className="flex-1 border p-2 rounded text-sm" value={content.profileImage} onChange={(e) => handleChange('profileImage', e.target.value)} placeholder="https://..." />
                             <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors flex items-center justify-center border border-gray-200" title="Загрузить файл">
                                <Upload size={20} className="text-gray-600"/>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profileImage')} />
                            </label>
                        </div>
                        {content.profileImage && <div className="h-32 w-24 bg-cover bg-center rounded" style={{backgroundImage: `url(${content.profileImage})`}}></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BlogTab: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [editing, setEditing] = useState<Partial<Article> | null>(null);

    useEffect(() => setArticles(getArticles()), []);

    const handleSave = () => {
        if (!editing?.title || !editing?.content) return;
        saveArticle({
            id: editing.id || crypto.randomUUID(),
            date: editing.date || new Date().toISOString(),
            title: editing.title,
            content: editing.content,
            excerpt: editing.excerpt || editing.content.substring(0, 100) + '...',
            image: editing.image
        } as Article);
        setArticles(getArticles());
        setEditing(null);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif">Блог</h2>
            
            {editing ? (
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <input className="w-full text-xl font-bold border-b p-2" placeholder="Заголовок" value={editing.title || ''} onChange={e => setEditing({...editing, title: e.target.value})} />
                    
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2"><ImageIcon size={14}/> Обложка статьи (URL)</label>
                        <input className="w-full border p-2 rounded text-sm mb-2" placeholder="https://..." value={editing.image || ''} onChange={e => setEditing({...editing, image: e.target.value})} />
                        {editing.image && <div className="h-32 w-full bg-cover bg-center rounded border border-gray-100" style={{backgroundImage: `url(${editing.image})`}}></div>}
                    </div>

                    <textarea className="w-full h-32 border p-2" placeholder="Краткое описание" value={editing.excerpt || ''} onChange={e => setEditing({...editing, excerpt: e.target.value})} />
                    <textarea className="w-full h-64 border p-2 font-mono text-sm" placeholder="Текст статьи (Markdown поддерживается)" value={editing.content || ''} onChange={e => setEditing({...editing, content: e.target.value})} />
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="bg-accent text-white px-4 py-2 rounded">Сохранить</button>
                        <button onClick={() => setEditing(null)} className="text-gray-500 px-4 py-2">Отмена</button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    <button onClick={() => setEditing({})} className="bg-primary text-white py-2 rounded hover:bg-accent transition-colors">Новая Статья</button>
                    {articles.map(a => (
                        <div key={a.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                {a.image && <div className="w-12 h-12 bg-cover bg-center rounded-sm" style={{backgroundImage: `url(${a.image})`}}></div>}
                                <div>
                                    <h3 className="font-bold">{a.title}</h3>
                                    <p className="text-sm text-gray-500">{new Date(a.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(a)}><Edit size={16} className="text-blue-500"/></button>
                                <button onClick={() => { deleteArticle(a.id); setArticles(getArticles()); }}><Trash2 size={16} className="text-red-500"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const BackupTab: React.FC = () => {
    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const success = importData(event.target.result as string);
                if (success) alert('Data restored successfully! Refresh page.');
                else alert('Invalid backup file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 max-w-xl">
            <h2 className="text-2xl font-serif">Backup & Restore</h2>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center space-y-4">
                    <Download size={48} className="mx-auto text-accent" />
                    <button onClick={handleExport} className="w-full bg-primary text-white py-2 rounded hover:bg-black transition-colors">Download JSON</button>
                    <p className="text-xs text-gray-400">Export Leads, Content, and Articles</p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center space-y-4">
                    <Upload size={48} className="mx-auto text-gray-400" />
                    <label className="block w-full cursor-pointer bg-white border border-gray-300 text-primary py-2 rounded hover:border-accent transition-colors">
                        Restore JSON
                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                    <p className="text-xs text-gray-400">Warning: Overwrites current data</p>
                </div>
            </div>
        </div>
    );
};