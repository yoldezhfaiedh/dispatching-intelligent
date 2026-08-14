export const VOCABULARY = {
  reference_date: { label: 'Date de référence', help: 'Date utilisée pour les calculs.' },
  total_shops: { label: 'Boutiques suivies', help: 'Nombre de boutiques actives analysées.' },
  total_products: { label: 'Produits suivis', help: 'Nombre de produits analysés.' },
  shops_at_stockout_risk: { label: 'Boutiques à risque de rupture', help: 'Boutiques susceptibles de manquer de stock.' },
  shops_at_overstock_risk: { label: 'Boutiques à risque de surstock', help: 'Boutiques dont le stock dépasse le besoin attendu.' },
  total_recommendations: { label: 'Recommandations', help: 'Nombre total d’actions proposées.' },
  high_priority_recommendations: { label: 'Actions urgentes', help: 'Recommandations nécessitant une intervention prioritaire.' },
  total_units_to_dispatch: { label: 'Unités à dispatcher', help: 'Quantité totale à envoyer vers les boutiques.' },
  most_critical_product: { label: 'Produit le plus critique', help: 'Produit présentant le risque le plus élevé.' },
  most_critical_governorate: { label: 'Gouvernorat le plus critique', help: 'Gouvernorat concentrant le risque le plus élevé.' },
  recommendation_date: { label: 'Date de recommandation', help: 'Date à laquelle l’action a été calculée.' },
  shop_id: { label: 'Identifiant boutique', help: 'Code unique de la boutique.' },
  product_id: { label: 'Identifiant produit', help: 'Code unique du produit.' },
  recommendation_type: { label: 'Type d’action', help: 'Nature de l’action recommandée.' },
  priority: { label: 'Priorité', help: 'Niveau d’urgence de l’action.' },
  suggested_qty: { label: 'Quantité suggérée', help: 'Nombre d’unités à dispatcher.' },
  business_reason: { label: 'Justification métier', help: 'Explication de la recommandation.' },
  estimated_7d_demand: { label: 'Demande prévue à 7 jours', help: 'Demande estimée sur les sept prochains jours.' },
  current_stock: { label: 'Stock disponible', help: 'Stock actuellement disponible en boutique.' },
  stock_on_hand: { label: 'Stock disponible', help: 'Unités actuellement présentes en boutique.' },
  stock_in_transit: { label: 'Stock en transit', help: 'Unités déjà expédiées mais non encore reçues.' },
  stockout_risk_score: { label: 'Score de risque de rupture', help: 'Probabilité estimée de rupture.' },
  predicted_demand_7d: { label: 'Demande prévue à 7 jours', help: 'Demande estimée sur les sept prochains jours.' },
  proba_stockout_7d: { label: 'Probabilité de rupture', help: 'Probabilité de manquer de stock dans les sept jours.' },
  reorder_point: { label: 'Seuil de réapprovisionnement', help: 'Niveau déclenchant un réapprovisionnement.' },
  order_up_to_level: { label: 'Stock cible', help: 'Niveau de stock visé après réapprovisionnement.' },
  base_daily_demand: { label: 'Demande quotidienne de base', help: 'Demande moyenne quotidienne.' },
  lag_1_sold_qty: { label: 'Ventes de la veille', help: 'Unités vendues le jour précédent.' },
  lag_7_sold_qty: { label: 'Ventes des 7 derniers jours', help: 'Unités vendues sur les sept derniers jours.' },
  unit_cost: { label: 'Coût unitaire', help: 'Coût d’une unité produit.' },
  catchment_score: { label: 'Potentiel de zone', help: 'Attractivité commerciale de la zone.' },
  governorate: { label: 'Gouvernorat', help: 'Gouvernorat de la boutique.' },
  region: { label: 'Région', help: 'Région administrative.' },
  shop_type: { label: 'Type de boutique', help: 'Catégorie de boutique.' },
} as const

export type VocabularyKey = keyof typeof VOCABULARY
export const labelFor = (value: string) => VOCABULARY[value as VocabularyKey]?.label ?? value
export const helpFor = (value: string) => VOCABULARY[value as VocabularyKey]?.help
export const TOOL_LABELS: Record<string, string> = {
  get_kpis: 'Indicateurs du jour',
  list_shops_at_risk: 'Recherche des boutiques à risque',
  list_shops_by_category: 'Recherche par catégorie de produit',
  explain_recommendation: "Analyse d'une recommandation",
  get_shop_situation: "Situation complète d'une boutique",
  compare_by_governorate: 'Comparaison par gouvernorat',
}
export const ENUM_LABELS: Record<string, Record<string, string>> = {
  priority: { High: 'Urgente', Medium: 'À surveiller', Low: 'Faible' },
  recommendation_type: { Dispatch: 'Dispatcher', Reorder: 'Réapprovisionner', Hold: 'Maintenir' },
}
export const labelEnum = (key: string, value: string) => ENUM_LABELS[key]?.[value] ?? value
export const csvLabels = Object.fromEntries(Object.entries(VOCABULARY).map(([key, value]) => [key, value.label])) as Record<string, string>

export const vocabularyEntries = Object.entries(VOCABULARY).map(([key, value]) => ({ key, ...value }))
