import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';

// ZMIANY vs oryginał:
// 1. Formularz zredukowany z 6 do 3 obowiązkowych pól (Name, Email, Challenge)
// 2. Firma i Telefon — opcjonalne, oznaczone w labelu
// 3. Pole "Opis/Message" usunięte — select wyzwania wystarczy do kwalifikacji leada
// 4. Submit button: "Wyślij zapytanie" → "Zarezerwuj bezpłatną konsultację →"
// 5. Pod przyciskiem: "Odpiszemy w ciągu 24 godzin"
// 6. Tytuł i sub sekcji — przepisane zgodnie z audytem
// 7. GA4 event: gtag('event', 'form_submit') po udanym wysłaniu

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    challenge: '',
    rodo: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, rodo: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rodo) {
      toast({
        variant: 'destructive',
        title: 'Błąd walidacji',
        description: 'Zgoda na przetwarzanie danych jest wymagana.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/mnngrewp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Imię_i_nazwisko:  formData.name,
          Firma:            formData.company,
          Email:            formData.email,
          Telefon:          formData.phone,
          Obszar_wyzwania:  formData.challenge,
        }),
      });

      if (response.ok) {
        // ── GA4: zdarzenie konwersji po udanym wysłaniu formularza ──
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'form_submit', {
            event_category: 'contact',
            event_label: formData.challenge || 'brak',
          });
        }

        toast({
          title: 'Wiadomość wysłana!',
          description: 'Dziękujemy za zapytanie. Odezwiemy się w ciągu 24 godzin.',
        });
        setFormData({ name: '', company: '', email: '', phone: '', challenge: '', rodo: false });
      } else {
        throw new Error('Błąd wysyłki');
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Błąd wysyłki',
        description: 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz na LinkedIn.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 md:p-12 rounded-2xl text-center"
        >
          {/* NOWY tytuł sekcji */}
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 max-w-3xl mx-auto">
            {t('contact.title')}
          </h2>
          {/* NOWY sub — "bez zobowiązań" */}
          <p className="text-base md:text-lg text-blue-100 mb-8">
            {t('contact.subtitle')}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg text-left shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Row 1: Imię (wymagane) + E-mail (wymagane) */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t('contact.name_label')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name" name="name"
                    placeholder={t('contact.name_placeholder')}
                    value={formData.name}
                    onChange={handleInputChange}
                    required disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('contact.email_label')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email" name="email" type="email"
                    placeholder={t('contact.email_placeholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Obszar wyzwania (wymagane) */}
              <div className="space-y-2">
                <Label htmlFor="challenge" className="text-sm font-medium">
                  {t('contact.challenge_label')} <span className="text-red-500">*</span>
                </Label>
                <select
                  id="challenge" name="challenge"
                  value={formData.challenge}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="">{t('contact.challenge_option_default')}</option>
                  <option value="Strategia i PMO">{t('contact.challenge_option1')}</option>
                  <option value="Transformacja cyfrowa i AI">{t('contact.challenge_option2')}</option>
                  <option value="Dotacje i finansowanie">{t('contact.challenge_option3')}</option>
                  <option value="Szkolenia i kompetencje">{t('contact.challenge_option4')}</option>
                  <option value="Inne">{t('contact.challenge_option5')}</option>
                </select>
              </div>

              {/* Row 3: Firma (opcjonalne) + Telefon (opcjonalne) */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-slate-500">
                    {t('contact.company_label')} <span className="text-slate-400 font-normal text-xs">({t('contact.optional')})</span>
                  </Label>
                  <Input
                    id="company" name="company"
                    placeholder={t('contact.company_placeholder')}
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-500">
                    {t('contact.phone_label')} <span className="text-slate-400 font-normal text-xs">({t('contact.optional')})</span>
                  </Label>
                  <Input
                    id="phone" name="phone" type="tel"
                    placeholder={t('contact.phone_placeholder')}
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* RODO */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="rodo"
                  checked={formData.rodo}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isSubmitting}
                />
                <Label htmlFor="rodo" className="text-sm text-slate-500 font-normal leading-relaxed">
                  {t('contact.rodo_label')}
                </Label>
              </div>

              {/* NOWY submit button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-4 text-base font-semibold rounded-lg group"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('contact.submitting')}
                  </>
                ) : (
                  <>
                    {t('contact.submit_button')}
                    <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* NOWE: reassurance pod przyciskiem */}
              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1 pt-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {t('contact.reassurance')}
              </p>

            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
