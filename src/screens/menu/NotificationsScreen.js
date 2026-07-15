import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccount } from '../../context/AccountContext';
import { useSettings } from '../../context/SettingsContext';
import { colors, spacing } from '../../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function when(iso) {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${h}:${mm} ${ampm}`;
}

export default function NotificationsScreen() {
  const { transactions, formatMoney } = useAccount();
  const { transactionAlerts } = useSettings();
  const [readIds, setReadIds] = useState([]);

  const data = useMemo(() => {
    if (!transactionAlerts) return [];
    return (transactions || []).map((t) => {
      const credit = t.type === 'credit';
      return {
        id: t.id,
        credit,
        title: credit ? 'Money Received' : 'Payment Sent',
        body: `${credit ? 'Received' : 'Sent'} ${formatMoney(t.amount)} ${credit ? 'from' : 'to'} ${t.counterparty}.`,
        date: t.date,
      };
    });
  }, [transactions, transactionAlerts, formatMoney]);

  const markAllRead = () => setReadIds(data.map((d) => d.id));

  if (!transactionAlerts) {
    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={54} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Alerts are turned off</Text>
        <Text style={styles.emptyText}>Enable “Transaction alerts” in Settings to see notifications here.</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={54} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptyText}>Your account activity will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <TouchableOpacity style={styles.markAll} onPress={markAllRead} activeOpacity={0.7}>
            <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const read = readIds.includes(item.id);
          return (
            <View style={[styles.item, !read && styles.itemUnread]}>
              <View style={[styles.iconWrap, { backgroundColor: item.credit ? '#E6F6EC' : '#F3E9F7' }]}>
                <MaterialCommunityIcons
                  name={item.credit ? 'arrow-down-left' : 'arrow-up-right'}
                  size={20}
                  color={item.credit ? colors.accentGreen : colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {!read && <View style={styles.dot} />}
                </View>
                <Text style={styles.itemBody}>{item.body}</Text>
                <Text style={styles.itemDate}>{when(item.date)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  markAll: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: spacing.md },
  markAllText: { color: colors.primary, fontWeight: '700', fontSize: 13, marginLeft: 4 },

  item: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  itemHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontSize: 14.5, fontWeight: '800', color: colors.textDark },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  itemBody: { fontSize: 13, color: colors.textDark, marginTop: 3 },
  itemDate: { fontSize: 11.5, color: colors.textMuted, marginTop: 5 },

  empty: { flex: 1, backgroundColor: colors.screenBg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginTop: spacing.md },
  emptyText: { fontSize: 13.5, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
