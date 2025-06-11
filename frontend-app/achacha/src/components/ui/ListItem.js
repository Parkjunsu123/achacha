import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ListItem as RNEListItem, Icon, ButtonGroup, CheckBox, Input } from 'react-native-elements';
import useTheme from '../../hooks/useTheme';
import Text from './Text';

/**
 * 기본 ListItem 컴포넌트
 */
const ListItem = ({
  children,
  containerStyle,
  variant = 'default',
  title,
  subtitle,
  leftElement,
  rightElement,
  bottomDivider = true,
  topDivider = false,
  onPress,
  disabled = false,
  ...props
}) => {
  const { listItem } = useTheme();
  const listItemStyles = listItem.getStyles();
  const variantStyle = listItem.getVariantStyle(variant);

  return (
    <RNEListItem
      containerStyle={[variantStyle, listItemStyles.container, containerStyle]}
      bottomDivider={bottomDivider}
      topDivider={topDivider}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {leftElement}
      {(title || subtitle) && (
        <RNEListItem.Content>
          {title && <RNEListItem.Title>{title}</RNEListItem.Title>}
          {subtitle && <RNEListItem.Subtitle>{subtitle}</RNEListItem.Subtitle>}
          {children}
        </RNEListItem.Content>
      )}
      {rightElement}
    </RNEListItem>
  );
};

/**
 * ListItem.Content 컴포넌트
 */
const ListItemContent = ({ children, style, ...props }) => {
  const { listItem } = useTheme();
  const listItemStyles = listItem.getStyles();

  return (
    <RNEListItem.Content style={[listItemStyles.content, style]} {...props}>
      {children}
    </RNEListItem.Content>
  );
};

/**
 * ListItem.Title 컴포넌트
 */
const ListItemTitle = ({ children, style, ...props }) => {
  const { listItem } = useTheme();
  const listItemStyles = listItem.getStyles();

  return (
    <RNEListItem.Title style={[listItemStyles.title, style]} {...props}>
      {children}
    </RNEListItem.Title>
  );
};

/**
 * ListItem.Subtitle 컴포넌트
 */
const ListItemSubtitle = ({ children, style, ...props }) => {
  const { listItem } = useTheme();
  const listItemStyles = listItem.getStyles();

  return (
    <RNEListItem.Subtitle style={[listItemStyles.subtitle, style]} {...props}>
      {children}
    </RNEListItem.Subtitle>
  );
};

/**
 * ListItem.Chevron 컴포넌트
 */
const ListItemChevron = ({ size = 24, color, style, ...props }) => {
  const { theme, listItem } = useTheme();
  const listItemStyles = listItem.getStyles();

  return (
    <RNEListItem.Chevron
      size={size}
      color={color || theme.colors.primary}
      style={[listItemStyles.chevron, style]}
      {...props}
    />
  );
};

/**
 * ListItem.CheckBox 컴포넌트
 */
const ListItemCheckBox = ({ checked, onPress, style, title, ...props }) => {
  const { theme } = useTheme();

  return (
    <CheckBox
      checked={checked}
      onPress={onPress}
      containerStyle={[styles.checkBoxContainer, style]}
      checkedColor={theme.colors.primary}
      title={title}
      {...props}
    />
  );
};

/**
 * ListItem.ButtonGroup 컴포넌트
 */
const ListItemButtonGroup = ({ buttons, selectedIndex, onPress, containerStyle, ...props }) => {
  const { theme, listItem } = useTheme();
  const listItemStyles = listItem.getStyles();

  return (
    <View style={listItemStyles.buttonGroup}>
      <ButtonGroup
        buttons={buttons}
        selectedIndex={selectedIndex}
        onPress={onPress}
        containerStyle={[styles.buttonGroupContainer, containerStyle]}
        selectedButtonStyle={{ backgroundColor: theme.colors.primary }}
        {...props}
      />
    </View>
  );
};

/**
 * ListItem.Input 컴포넌트
 */
const ListItemInput = ({ containerStyle, inputStyle, ...props }) => {
  const { listItem } = useTheme();
  const listItemStyles = listItem.getStyles();

  return (
    <Input
      containerStyle={[listItemStyles.input, containerStyle]}
      inputStyle={[styles.inputText, inputStyle]}
      {...props}
    />
  );
};

/**
 * ListItem.Accordion 컴포넌트
 */
const ListItemAccordion = ({
  isExpanded,
  onPress,
  content,
  expandedContent,
  containerStyle,
  contentStyle,
  expandedContentStyle,
  icon,
  expandIcon = 'keyboard-arrow-down',
  collapseIcon = 'keyboard-arrow-up',
  ...props
}) => {
  const { theme, listItem } = useTheme();
  const listItemStyles = listItem.getStyles();
  const [expanded, setExpanded] = useState(isExpanded || false);

  const handlePress = () => {
    setExpanded(prev => !prev);
    if (onPress) onPress(!expanded);
  };

  return (
    <View style={styles.accordionContainer}>
      <RNEListItem
        containerStyle={[
          listItem.getVariantStyle('default'),
          listItemStyles.container,
          containerStyle,
        ]}
        onPress={handlePress}
        {...props}
      >
        {icon && <Icon name={icon} type="material" color={theme.colors.primary} />}
        <RNEListItem.Content style={[listItemStyles.content, contentStyle]}>
          {content}
        </RNEListItem.Content>
        <Icon
          name={expanded ? collapseIcon : expandIcon}
          type="material"
          color={theme.colors.grey4}
        />
      </RNEListItem>
      {expanded && (
        <View style={[listItemStyles.accordionContent, expandedContentStyle]}>
          {expandedContent}
        </View>
      )}
    </View>
  );
};

/**
 * ListItem.Swipeable 컴포넌트
 */
const ListItemSwipeable = ({
  leftContent,
  rightContent,
  leftWidth = 80,
  rightWidth = 80,
  leftStyle,
  rightStyle,
  leftAction,
  rightAction,
  leftIcon,
  rightIcon,
  containerStyle,
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  onPress,
  bottomDivider = true,
  leftActionable = true,
  rightActionable = true,
  ...props
}) => {
  const { theme, listItem } = useTheme();
  const listItemStyles = listItem.getStyles();

  return (
    <RNEListItem.Swipeable
      leftContent={
        leftActionable && (
          <RNEListItem.Content
            style={[
              listItemStyles.swipeableActionContent,
              { backgroundColor: theme.colors.primary },
              leftStyle,
            ]}
          >
            {leftContent ||
              (leftIcon && (
                <Icon
                  name={typeof leftIcon === 'string' ? leftIcon : 'edit'}
                  type="material"
                  color={theme.colors.white}
                  size={24}
                />
              ))}
          </RNEListItem.Content>
        )
      }
      rightContent={
        rightActionable && (
          <RNEListItem.Content
            style={[
              listItemStyles.swipeableActionContent,
              { backgroundColor: theme.colors.error },
              rightStyle,
            ]}
          >
            {rightContent ||
              (rightIcon && (
                <Icon
                  name={typeof rightIcon === 'string' ? rightIcon : 'delete'}
                  type="material"
                  color={theme.colors.white}
                  size={24}
                />
              ))}
          </RNEListItem.Content>
        )
      }
      leftWidth={leftWidth}
      rightWidth={rightWidth}
      onLeftSwipe={leftAction}
      onRightSwipe={rightAction}
      onPress={onPress}
      bottomDivider={bottomDivider}
      containerStyle={[listItemStyles.container, containerStyle]}
      {...props}
    >
      {title && (
        <RNEListItem.Title style={[listItemStyles.title, titleStyle]}>{title}</RNEListItem.Title>
      )}
      {subtitle && (
        <RNEListItem.Subtitle style={[listItemStyles.subtitle, subtitleStyle]}>
          {subtitle}
        </RNEListItem.Subtitle>
      )}
    </RNEListItem.Swipeable>
  );
};

/**
 * ListItem.NotificationCard 컴포넌트
 */
const ListItemNotificationCard = ({
  title,
  message,
  time,
  onPress,
  containerStyle,
  titleStyle,
  messageStyle,
  timeStyle,
  icon,
  iconType = 'material',
  iconColor = '#4B9CFF',
  iconSize = 24,
  iconContainerStyle,
  ...props
}) => {
  return (
    <View style={styles.notificationCardContainer}>
      <TouchableOpacity
        style={[styles.notificationCard, containerStyle]}
        onPress={onPress}
        activeOpacity={0.85}
        {...props}
      >
        <View style={styles.notificationCardRow}>
          {icon && (
            <View style={[styles.iconContainer, iconContainerStyle]}>
              <Icon name={icon} type={iconType} color={iconColor} size={iconSize} />
            </View>
          )}

          <View style={[styles.notificationCardContent, icon ? styles.withIconSpacing : null]}>
            <View style={styles.titleRow}>
              <Text variant="body1" weight="bold" style={[styles.notificationTitle, titleStyle]}>
                {title}
              </Text>
              <Text variant="caption" style={[styles.notificationTime, timeStyle]}>
                {time}
              </Text>
            </View>
            <Text
              variant="body2"
              style={[styles.notificationMessage, messageStyle]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {message}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// 컴포넌트 연결
ListItem.Content = ListItemContent;
ListItem.Title = ListItemTitle;
ListItem.Subtitle = ListItemSubtitle;
ListItem.Chevron = ListItemChevron;
ListItem.CheckBox = ListItemCheckBox;
ListItem.ButtonGroup = ListItemButtonGroup;
ListItem.Input = ListItemInput;
ListItem.Accordion = ListItemAccordion;
ListItem.Swipeable = ListItemSwipeable;
ListItem.NotificationCard = ListItemNotificationCard;

const styles = StyleSheet.create({
  accordionContainer: {
    overflow: 'hidden',
  },
  checkBoxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  buttonGroupContainer: {
    borderRadius: 8,
  },
  inputText: {
    fontSize: 14,
  },
  // NotificationCard 스타일
  notificationCardContainer: {
    marginBottom: 12,
  },
  notificationCard: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationCardRow: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationCardContent: {
    flex: 1,
  },
  withIconSpacing: {
    paddingLeft: 0,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#3B3B3B',
    flex: 1,
    marginRight: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
    color: '#555555',
  },
  notificationTime: {
    fontSize: 12,
    color: '#737373',
    marginRight: 5,
  },
});

export default ListItem;
