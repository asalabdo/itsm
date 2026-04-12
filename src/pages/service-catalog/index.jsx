import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import serviceRequestService from '../../services/serviceRequestService';
import DynamicFormRenderer from '../../components/ui/DynamicFormRenderer';

const ServiceCatalogHub = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);

  const isHiddenCatalogItem = (item) => {
    const name = String(item?.name || '').trim().toLowerCase();
    const category = String(item?.category || '').trim().toLowerCase();
    return category === 'hardware' || name === 'macbook pro m3';
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const data = await serviceRequestService.getCatalog();
      setCatalog(data);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await serviceRequestService.submitRequest({
        title: `Request for ${selectedItem.name}`,
        description: `User requested ${selectedItem.name} via Service Catalog.`,
        catalogItemId: selectedItem.id,
        customDataJson: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: 'Request submitted successfully.' });
      setSelectedItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({ type: 'error', text: 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const visibleCatalog = catalog.filter((item) => !isHiddenCatalogItem(item));
    if (!query) return visibleCatalog;
    return visibleCatalog.filter((item) => [
      item.name,
      item.description,
      item.category,
    ].join(' ').toLowerCase().includes(query));
  }, [catalog, searchQuery]);
  const filteredCategories = [...new Set(filteredCatalog.map(item => item.category))];

  return (
    <>
      <Helmet>
        <title>Service Catalog - ITSM</title>
      </Helmet>
      <Header />
      <main className="pt-16 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Service Catalog</h1>
              <p className="text-muted-foreground mt-1">Browse and request IT services and equipment.</p>
            </div>
            <Input
              type="search"
              placeholder="Search services, categories, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="max-w-xl"
            />
          </div>

          {message && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-700'
            }`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              Loading catalog...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Icon name="PackageSearch" size={36} className="mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold mt-4">No services found</h2>
              <p className="text-muted-foreground mt-2">Try a different keyword or clear the search to see the full catalog.</p>
            </div>
          ) : (
            filteredCategories.map(category => (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.filter(item => item.category === category).map(item => (
                    <div 
                      key={item.id}
                      className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors">
                          <Icon name={item.icon || 'Package'} size={24} className="text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">SLA: {item.defaultSlaHours}h</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="mt-6 w-full py-2.5 bg-muted text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
                      >
                        <Icon name="Plus" size={18} />
                        Request Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Request Modal */}
          {selectedItem && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">New {selectedItem.name} Request</h3>
                  <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleRequest} className="p-6 space-y-6">
                  <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-4">
                    <Icon name="Info" size={20} className="text-blue-600 mt-1" />
                    <p className="text-sm text-blue-800 flex-1">
                      You are requesting <strong>{selectedItem.name}</strong>. {selectedItem.requiresApproval ? "This request requires manager approval." : "This request will be fulfilled immediately upon submission."}
                    </p>
                  </div>

                  {/* Dynamic Form Fields */}
                  <div className="space-y-4">
                    <DynamicFormRenderer 
                      config={JSON.parse(selectedItem.formConfigJson || '[]')}
                      value={formData}
                      onChange={setFormData}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 py-3 font-bold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ServiceCatalogHub;
