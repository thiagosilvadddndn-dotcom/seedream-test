'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/sections/hero/1/ui/button';
import { CheckCircle, X, CreditCard, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const PaymentSuccessModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'canceled' | null>(null);
  const searchParams = useSearchParams();
  const t = useTranslations('payment');

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setPaymentStatus('success');
      setIsOpen(true);
    } else if (canceled === 'true') {
      setPaymentStatus('canceled');
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    // 清理URL参数
    const url = new URL(window.location.href);
    url.searchParams.delete('success');
    url.searchParams.delete('canceled');
    url.searchParams.delete('session_id');
    window.history.replaceState({}, '', url.pathname);
  };

  if (!paymentStatus) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "sm:max-w-md border-2",
        paymentStatus === 'success' 
          ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" 
          : "border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
      )}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            {paymentStatus === 'success' ? (
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping"></div>
                <div className="relative bg-green-500 rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="bg-red-500 rounded-full p-3">
                <X className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          <DialogTitle className={cn(
            "text-center text-xl font-bold",
            paymentStatus === 'success' ? "text-green-800" : "text-red-800"
          )}>
            {paymentStatus === 'success' ? (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>{t ? t('success.title') : 'Payment Successful!'}</span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
            ) : (
              t ? t('canceled.title') : 'Payment Canceled'
            )}
          </DialogTitle>
          
          <DialogDescription className={cn(
            "text-center mt-4 text-base leading-relaxed",
            paymentStatus === 'success' ? "text-green-700" : "text-red-700"
          )}>
            {paymentStatus === 'success' ? (
              <div className="space-y-2">
                <p>{t ? t('success.description') : 'Thank you for your subscription! Your credits have been added to your account.'}</p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Start generating amazing images now!
                  </span>
                </div>
              </div>
            ) : (
              t ? t('canceled.description') : 'Your payment was canceled. No charges were made.'
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleClose}
            className={cn(
              paymentStatus === 'success' 
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
                : "bg-gray-600 hover:bg-gray-700"
            )}
            size="lg"
          >
            {paymentStatus === 'success' ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t ? t('close') : 'Start Creating'}
              </>
            ) : (
              t ? t('close') : 'Close'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessModal; 