import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { BenefitsScreen } from '../../capabilities/benefits/presentation/screens/BenefitsScreen';
import { loadLocalBenefits } from '../composition/benefitsDependencies';
import { CardsScreen } from '../../capabilities/cards/presentation/screens/CardsScreen';
import { loadLocalProducts } from '../composition/cardsDependencies';
import { secureDependencies } from '../composition/secureDependencies';
import { colors, spacing } from '../theme/tokens';

export type DashboardTabList = {
  Products: undefined;
  Benefits: undefined;
};

const Tab = createBottomTabNavigator<DashboardTabList>();

function BenefitsRoute(): React.JSX.Element {
  const isFocused = useIsFocused();
  return (
    <BenefitsScreen loadBenefits={loadLocalBenefits} isFocused={isFocused} />
  );
}

function ProductsRoute(): React.JSX.Element {
  return (
    <CardsScreen
      loadProducts={loadLocalProducts}
      secureAccess={secureDependencies}
    />
  );
}

function TabIcon({
  symbol,
  focused,
  color,
}: {
  symbol: string;
  focused: boolean;
  color: string;
}): React.JSX.Element {
  return (
    <View style={styles.icon} accessible={false}>
      <Text style={[styles.iconSymbol, { color }]}>{symbol}</Text>
      {focused ? <View style={styles.activeMark} /> : null}
    </View>
  );
}

function productsTabIcon({
  focused,
  color,
}: {
  focused: boolean;
  color: string;
}) {
  return <TabIcon symbol="▤" focused={focused} color={color} />;
}

function benefitsTabIcon({
  focused,
  color,
}: {
  focused: boolean;
  color: string;
}) {
  return <TabIcon symbol="✧" focused={focused} color={color} />;
}

export default function DashboardNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      initialRouteName="Products"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        sceneStyle: styles.scene,
      }}
    >
      <Tab.Screen
        name="Products"
        component={ProductsRoute}
        options={{
          tabBarLabel: 'Mis productos',
          tabBarAccessibilityLabel: 'Mis productos',
          tabBarIcon: productsTabIcon,
        }}
      />
      <Tab.Screen
        name="Benefits"
        component={BenefitsRoute}
        options={{
          tabBarLabel: 'Beneficios',
          tabBarAccessibilityLabel: 'Beneficios',
          tabBarIcon: benefitsTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.background },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 8,
    paddingTop: spacing.xs,
  },
  tabItem: { minHeight: 56 },
  tabLabel: { fontSize: 12, fontWeight: '700' },
  icon: { alignItems: 'center', justifyContent: 'center', minHeight: 26 },
  iconSymbol: { fontSize: 24, lineHeight: 26 },
  activeMark: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 3,
    marginTop: 2,
    width: 18,
  },
});
