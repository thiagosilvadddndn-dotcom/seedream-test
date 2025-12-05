'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const t = useTranslations('auth.signin');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { 
        redirect: false,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-lg border border-primary/50 shadow-xl rounded-xl p-6 z-50">
        {/* 简化的背景效果 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -z-10"></div>
        
        <DialogHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center px-3 py-1.5 bg-primary/20 rounded-full border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">AI Video</span>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2">
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 h-12 text-base font-medium bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-200"
            disabled={isLoading}
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-foreground">{isLoading ? 'Loading...' : t('withGoogle')}</span>
          </Button>
          
          {/* 简化的装饰效果 */}
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full mt-4"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 