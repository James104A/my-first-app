import { StyleSheet, View, Pressable, Linking } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { Concert } from '@/types/concert';

interface ConcertCardProps {
  concert: Concert;
}

export function ConcertCard({ concert }: ConcertCardProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const formatDate = (datetimeStr: string) => {
    const date = new Date(datetimeStr);
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

    return `${formattedDate} · ${formattedTime}`;
  };

  const handlePress = () => {
    if (concert.ticketUrl) {
      Linking.openURL(concert.ticketUrl);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView style={[styles.card, { borderColor: colors.icon }]}>
        <View style={[styles.dateStrip, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.dateStripText}>
            {new Date(concert.datetime).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.dateStripDay}>
            {new Date(concert.datetime).getDate()}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText type="subtitle" numberOfLines={2}>
            {concert.artistName}
          </ThemedText>

          {concert.lineup.length > 1 && (
            <ThemedText style={styles.lineup} numberOfLines={1}>
              with {concert.lineup.filter(a => a !== concert.artistName).join(', ')}
            </ThemedText>
          )}

          <ThemedText style={[styles.date, { color: colors.tint }]}>
            {formatDate(concert.datetime)}
          </ThemedText>

          <ThemedText style={styles.venue} numberOfLines={1}>
            {concert.venue.name}
          </ThemedText>

          <ThemedText style={styles.location} numberOfLines={1}>
            {concert.venue.city}{concert.venue.region ? `, ${concert.venue.region}` : ''} · {concert.distance.toFixed(1)} mi away
          </ThemedText>

          <View style={styles.footer}>
            <ThemedText style={[styles.ticketLink, { color: colors.tint }]}>
              Get Tickets →
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  dateStrip: {
    width: 60,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStripText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateStripDay: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 2,
  },
  lineup: {
    fontSize: 13,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  venue: {
    fontSize: 14,
    opacity: 0.9,
  },
  location: {
    fontSize: 13,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  ticketLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
