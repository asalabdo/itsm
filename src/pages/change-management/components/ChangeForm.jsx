import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ChangeForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    riskLevel: 'Low',
    category: 'Normal',
    implementationPlan: '',
    backoutPlan: '',
    testingPlan: '',
    scheduledStartDate: '',
    scheduledEndDate: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'العنوان مطلوب';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'الوصف مطلوب';
    }

    if (formData.scheduledStartDate && formData.scheduledEndDate && new Date(formData.scheduledEndDate) < new Date(formData.scheduledStartDate)) {
      nextErrors.scheduledEndDate = 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">طلب تغيير جديد</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-smooth">
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">العنوان</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
                placeholder="مثال: ترقية قاعدة بيانات الإنتاج"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الأولوية</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                <option value="Low">منخفضة</option>
                <option value="Medium">متوسطة</option>
                <option value="High">عالية</option>
                <option value="Critical">حرجة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الفئة</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                <option value="Standard">قياسي</option>
                <option value="Normal">عادي</option>
                <option value="Emergency">طارئ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">مستوى المخاطر</label>
              <select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                <option value="Low">منخفض</option>
                <option value="Medium">متوسط</option>
                <option value="High">مرتفع</option>
              </select>
            </div>
          </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الوصف</label>
              <textarea
                required
                rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              placeholder="قدّم وصفًا تفصيليًا للتغيير..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-slate-100 pb-2">خطط التغيير</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">خطة التنفيذ</label>
              <textarea
                rows="2"
                name="implementationPlan"
                value={formData.implementationPlan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
                placeholder="دليل التنفيذ خطوة بخطوة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">بداية الجدولة</label>
              <input
                type="datetime-local"
                name="scheduledStartDate"
                value={formData.scheduledStartDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نهاية الجدولة</label>
              <input
                type="datetime-local"
                name="scheduledEndDate"
                value={formData.scheduledEndDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
              {errors.scheduledEndDate && <p className="mt-2 text-sm text-rose-500">{errors.scheduledEndDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">خطة الاختبار</label>
              <textarea
                rows="2"
                name="testingPlan"
                value={formData.testingPlan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              placeholder="خطوات التحقق من النجاح..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">خطة التراجع</label>
              <textarea
                rows="2"
                name="backoutPlan"
                value={formData.backoutPlan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-smooth"
              placeholder="خطوات التراجع عن التغييرات إذا حدث فشل..."
              />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="px-5 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-smooth"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-smooth shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="Check" size={18} />}
            إنشاء الطلب
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeForm;
