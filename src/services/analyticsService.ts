
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  path?: string;
}

export const trackEvent = async ({ event_type, event_data = {}, path }: AnalyticsEvent) => {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        event_data,
        path: path || window.location.pathname,
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Error tracking event:', error);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};
