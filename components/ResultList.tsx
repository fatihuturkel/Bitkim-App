import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define TypeScript interfaces
export interface ResultItem {
  id: string;
  title: string;
  details?: string[]; 
  timestamp?: string;
  status?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isItemCollapsible?: boolean;
  initiallyItemCollapsed?: boolean;
  imageUrl?: string | null; // URL to the image, can be a permanent path or original URI
  expandedDetails?: {
    analysisResults: ResultItem[];
    imageSource?: string | null;
  };
}

interface ResultListProps {
  results: ResultItem[];
  title?: string;
  emptyText?: string;
  headerIcon?: keyof typeof Ionicons.glyphMap;
  isCollapsible?: boolean;
  initiallyCollapsed?: boolean;
}

// Utility function for date formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to generate styles based on theme colors
const useStyles = () => {
  const systemBackground = useThemeColor({}, 'systemBackground');
  const mixListItemBackground = useThemeColor({}, 'mixListItemBackground');
  const separatorColor = useThemeColor({}, 'separator');
  const primaryAccentColor = useThemeColor({}, 'systemGreen'); // Mapped from #438254
  const labelColor = useThemeColor({}, 'label');
  const secondaryLabelColor = useThemeColor({}, 'secondaryLabel');
  const tertiaryLabelColor = useThemeColor({}, 'tertiaryLabel');
  const statusBadgeBackgroundColor = useThemeColor({}, 'systemGray5'); // Changed from 'secondarySystemBackground'

  // Colors for potentially unused badge styles, themed for completeness
  const resultBadgeBackgroundColor = useThemeColor({}, 'systemGray4'); // Mapped from #E0E0E0
  const healthyBadgeBackgroundColor = useThemeColor({}, 'systemGreen'); // Mapped from #E6F4EA (will be solid green)
  const unhealthyBadgeBackgroundColor = useThemeColor({}, 'systemRed'); // Mapped from #FEEAE6 (will be solid red)


  return StyleSheet.create({
    historyContainer: {
      backgroundColor: systemBackground,
      borderRadius: 10,
      padding: 15,
      marginTop: 10,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: separatorColor,
    },
    historyTitleContainer: { // New container for title and main icon
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // Allow it to take available space
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: primaryAccentColor,
      marginLeft: 10,
    },
    collapsibleIcon: { // Style for the chevron icon
      marginLeft: 'auto', // Push to the right
      paddingLeft: 10, // Add some spacing
    },
    historyList: {
      paddingBottom: 10,
    },
    historyItem: {
      backgroundColor: mixListItemBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      borderLeftWidth: 3,
      borderLeftColor: primaryAccentColor,
      borderRightWidth: 1,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderRightColor: separatorColor,
      borderTopColor: separatorColor,      borderBottomColor: separatorColor,
      shadowColor: '#000', // Standard shadow color
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    historyItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // Removed marginBottom: 5, as content below might be hidden
    },
    plantNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      flex: 1, // Allow title to take space before item chevron
    },
    itemIcon: {
      marginRight: 5,
    },
    itemImage: {
      width: 100,
      height: 100,
      borderRadius: 4,
      marginRight: 10,
    },
    itemCollapsibleIcon: { // Style for the item's chevron icon
      marginLeft: 10, // Add some spacing
      paddingLeft: 5,
    },
    historyItemContent: { // New style to wrap collapsible content
      marginTop: 5, // Add margin if content is visible
    },
    plantName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: labelColor,
      flexShrink: 1,
    },
    timeStamp: {
      fontSize: 12,
      color: tertiaryLabelColor,
    },
    resultBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      backgroundColor: resultBadgeBackgroundColor,
      marginLeft: 5,
    },
    healthyBadge: {
      backgroundColor: healthyBadgeBackgroundColor,
    },
    unhealthyBadge: {
      backgroundColor: unhealthyBadgeBackgroundColor,
    },
    resultText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: labelColor,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      backgroundColor: statusBadgeBackgroundColor,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: secondaryLabelColor,
    },
    detailsContainer: {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 5,
    },
    detailText: {
      fontSize: 14,
      color: secondaryLabelColor,
      marginBottom: 2,
    },
    emptyHistory: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 30,
    },
    emptyHistoryText: {
      color: tertiaryLabelColor,
      marginTop: 10,
      textAlign: 'center',
    },
  });
};

// Result List Item Component
const ResultListItem: React.FC<{
  item: ResultItem;
}> = ({ item }) => {
  const styles = useStyles();
  const itemIconColor = useThemeColor({}, 'systemGreen');
  const [isItemCollapsed, setIsItemCollapsed] = useState(
    item.isItemCollapsible ? item.initiallyItemCollapsed ?? true : false
  );

  const toggleItemCollapse = () => {
    if (item.isItemCollapsible) {
      setIsItemCollapsed(!isItemCollapsed);
    }
  };
  return (
    <View key={item.id} style={styles.historyItem}>
      <TouchableOpacity onPress={toggleItemCollapse} disabled={!item.isItemCollapsible} activeOpacity={item.isItemCollapsible ? 0.7 : 1}>
        <View style={styles.historyItemHeader}>
          <View style={styles.plantNameContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : item.icon ? (
              <Ionicons
                name={item.icon}
                size={16}
                color={itemIconColor}
                style={styles.itemIcon}
              />
            ) : null}
            <Text style={[styles.plantName, !item.icon && !item.imageUrl && { marginLeft: 0 }]}>{item.title}</Text>
          </View>
          {item.status && !item.isItemCollapsible && ( // Only show status here if not collapsible, or handle differently
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
          {item.isItemCollapsible && (
            <Ionicons
              name={isItemCollapsed ? "chevron-down-outline" : "chevron-up-outline"}
              size={18}
              color={itemIconColor}
              style={styles.itemCollapsibleIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      {(!item.isItemCollapsible || !isItemCollapsed) && (
        <View style={styles.historyItemContent}>
          {item.status && item.isItemCollapsible && ( // Show status inside collapsible content if item is collapsible
            <View style={[styles.statusBadge, { marginBottom: 5 }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
          {item.details && item.details.length > 0 && (
            <View style={styles.detailsContainer}>
              {item.details.map((detail, index) => (
                <Text key={index} style={styles.detailText}>{detail}</Text>
              ))}
            </View>
          )}
          {item.timestamp && (
            <Text style={styles.timeStamp}>{formatDate(item.timestamp)}</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Empty Results Component
const EmptyResults: React.FC<{ emptyText?: string }> = ({ emptyText = "Henüz sonuç bulunmamaktadır." }) => {
  const styles = useStyles();
  const emptyIconColor = useThemeColor({}, 'quaternaryLabel');

  return (
    <View style={styles.emptyHistory}>
      <Ionicons name="search-outline" size={40} color={emptyIconColor} />
      <Text style={styles.emptyHistoryText}>{emptyText}</Text>
    </View>
  );
};

// Main ResultList Component
const ResultList: React.FC<ResultListProps> = ({
  results,
  title = "Sonuç Listesi",
  emptyText,
  headerIcon = "list-outline",
  isCollapsible = false,
  initiallyCollapsed = false,
}) => {
  const styles = useStyles();
  const themedHeaderIconColor = useThemeColor({}, 'systemGreen');
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible ? initiallyCollapsed : false);

  const toggleCollapse = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <View style={styles.historyContainer}>
      <TouchableOpacity onPress={toggleCollapse} disabled={!isCollapsible} activeOpacity={isCollapsible ? 0.7 : 1}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleContainer}>
            {headerIcon && <Ionicons name={headerIcon} size={18} color={themedHeaderIconColor} />}
            <Text style={styles.historyTitle}>{title}</Text>
          </View>
          {isCollapsible && (
            <Ionicons
              name={isCollapsed ? "chevron-down-outline" : "chevron-up-outline"}
              size={18}
              color={themedHeaderIconColor}
              style={styles.collapsibleIcon}
            />
          )}
        </View>
      </TouchableOpacity>
      
      {(!isCollapsible || !isCollapsed) && (
        results.length > 0 ? (
          <View style={styles.historyList}>
            {results.map(item => (
              <ResultListItem key={item.id} item={item} />
            ))}
          </View>
        ) : (
          <EmptyResults emptyText={emptyText} />
        )
      )}
    </View>
  );
};

export default ResultList;