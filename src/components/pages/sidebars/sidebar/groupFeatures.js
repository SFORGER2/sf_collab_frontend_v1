export function groupFeatures(features) {
    return features.reduce((groups, feature) => {
      if (!groups[feature.type]) {
        groups[feature.type] = [];
      }
      groups[feature.type].push(feature);
      return groups;
    }, {});
  }