import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { colors, spacing } from '../theme';

export default function TransactionsScreen({ navigation }) {
  const { transactions, formatMoney } = useAccount();

  const renderItem = ({ item }) => {
    const isCredit = item.type === 'credit';
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Receipt', { txn: item })}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: isCredit ? '#E3F4EA' : '#F2E7F7' },
          ]}
        >
          <MaterialCommunityIcons
            name={isCredit ? 'arrow-down' : 'arrow-up'}
            size={22}
            color={isCredit ? colors.accentGreen : colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.counterparty}
          </Text>
          <Text style={styles.txnId}>{item.id}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={[
              styles.amount,
              { color: isCredit ? colors.accentGreen : colors.textDark },
            ]}
          >
            {isCredit ? '+ ' : '- '}
            {formatMoney(item.amount)}
          </Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.tileBorder,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  txnId: { fontSize: 10.5, color: colors.primaryLight, marginTop: 3, fontWeight: '600' },
  amount: { fontSize: 14, fontWeight: '800' },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
