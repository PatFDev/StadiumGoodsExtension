document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchButton').addEventListener('click', function () {
      const searchTerm = document.getElementById('searchInput').value;
      if (searchTerm) {
        fetchData(searchTerm);
      }
    });
  });


  function fetchData(searchTerm) {
    const graphqlQuery = {
      query: "query MainContentContainerRefetchQuery(\n  $searchTerm: String\n  $maxProductsShown: Int\n  $sgpsFromUrl: [String!]\n  $sgpsFromDY: [String!]\n  $maxProductsFetched: Int\n) {\n  ...MainContentContainer_query_Ismtc\n}\n\nfragment MainContentContainer_query_Ismtc on Query {\n  configurableProducts(query: $searchTerm, sgps: $sgpsFromDY, maxRecords: $maxProductsShown) {\n    ...ProductSearchContainer_searchResults\n    edges {\n      node {\n        id\n        manufacturerSku\n        ...ManageProductProfilesModalContainer_searchProduct\n      }\n    }\n  }\n  selectedProductBySgp: configurableProducts(sgps: $sgpsFromUrl, maxRecords: $maxProductsFetched) {\n    edges {\n      node {\n        id\n        manufacturerSku\n        ...ManageProductProfilesModalContainer_searchProduct\n      }\n    }\n  }\n}\n\nfragment ManageProductProfilesModalContainer_searchProduct on ProductInterface {\n  __isProductInterface: __typename\n  id\n  manufacturerSku\n  intakeEnabled\n  sgp\n  variants {\n    edges {\n      node {\n        averageSalesPriceCents\n        lastSoldAt {\n          formattedValue(format: DATE)\n        }\n        lastSoldCents\n        minPriceCents\n        size\n        id\n      }\n    }\n  }\n  variantSizes {\n    size\n    sizeCode\n  }\n  autoApprovedSizes {\n    size\n    maxPrice {\n      __typename\n      ... on Price {\n        value {\n          value\n        }\n      }\n    }\n    minPrice {\n      __typename\n      ... on Price {\n        value {\n          value\n        }\n      }\n    }\n  }\n  ...ManageProductProfilesModal_searchProduct\n}\n\nfragment ManageProductProfilesModal_searchProduct on ProductInterface {\n  __isProductInterface: __typename\n  image(size: MEDIUM) {\n    url\n  }\n  brand\n  name\n  description\n  manufacturerSku\n  sgp\n  gender\n  color\n  nickname\n  releaseYear\n  variants {\n    edges {\n      node {\n        averageSalesPriceCents\n        lastSoldAt {\n          formattedValue(format: DATE)\n        }\n        lastSoldCents\n        minPriceCents\n        size\n        id\n      }\n    }\n  }\n  commissionPromotion {\n    endDate {\n      timestamp\n    }\n    startDate {\n      timestamp\n    }\n    isOnAllSizes\n    promotionRate\n    floorRate\n    sizes\n    id\n  }\n  ...ProductProfileDetails_searchProduct\n  variantSizes {\n    size\n    sizeCode\n  }\n}\n\nfragment ProductProfileDetails_searchProduct on ProductInterface {\n  __isProductInterface: __typename\n  id\n  manufacturerSku\n  variantSizes {\n    size\n    sizeCode\n  }\n  autoApprovedSizes {\n    size\n    maxPrice {\n      __typename\n      ... on Price {\n        value {\n          value\n        }\n      }\n    }\n    minPrice {\n      __typename\n      ... on Price {\n        value {\n          value\n        }\n      }\n    }\n  }\n}\n\nfragment ProductSearchContainer_searchResults on SearchProductConnection {\n  ...ProductSearchResults_products\n}\n\nfragment ProductSearchResults_products on SearchProductConnection {\n  edges {\n    node {\n      id\n      manufacturerSku\n      sgp\n      intakeEnabled\n      ...ProductTileContainer_product\n    }\n  }\n}\n\nfragment ProductTileContainer_product on SearchProduct {\n  id\n  brand\n  color\n  description\n  gender\n  image(size: MEDIUM) {\n    url\n  }\n  manufacturerSku\n  name\n  releaseYear\n  nickname\n  intakeEnabled\n  commissionPromotion {\n    endDate {\n      timestamp\n    }\n    isOnAllSizes\n    sizes\n    id\n  }\n  variantSizes {\n    size\n    sizeCode\n  }\n}\n",
      variables: {
        searchTerm: searchTerm,
        maxProductsShown: 19,
        sgpsFromUrl: [" "],
        sgpsFromDY: [],
        maxProductsFetched: 1
      }
    };
  
    fetch("https://sellers.stadiumgoods.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json
      },
      body: JSON.stringify(graphqlQuery),
      credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
      displayData(data);
    })
    .catch(error => {
      document.getElementById('data').innerText = 'Error, Please try again!';
    });
}
  
function displayData(data) {
    const sizes = data?.data?.configurableProducts?.edges[0].node.variants.edges || [];
    const image = data?.data?.configurableProducts?.edges[0]?.node?.image?.url;
    const sku = data?.data?.configurableProducts?.edges[0]?.node?.manufacturerSku;
    const name = data?.data?.configurableProducts?.edges[0]?.node?.name;
    const color = data?.data?.configurableProducts?.edges[0]?.node?.nickname;
  
    let productDetailsHTML = `
      <div id="productDetails" style="text-align: center; margin-bottom: 20px;">
        <img src="${image}" alt="${name}" style="max-width: 100%; border: 1px solid #ccc; border-radius: 5px; margin-bottom: 10px;" />
        <div><strong>SKU:</strong> ${sku || 'N/A'}</div>
        <div><strong>Name:</strong> ${name || 'N/A'}</div>
        <div><strong>Color:</strong> ${color || 'N/A'}</div>
      </div>
    `;
  
    let tableHTML = '<table><tr><th>Size</th><th>Last Sold Date</th><th>Last Sold Price</th><th>Payout</th></tr>';
  
    sizes.forEach(sizer => {
      const node = sizer.node;
      const size = node?.size || 'N/A';
      const lastSoldDate = node?.lastSoldAt?.formattedValue || 'No data';
      const lastSoldPrice = node?.lastSoldCents ? `$${(node.lastSoldCents / 100).toFixed(2)}` : 'No data';
      const payoutAmount = (node.lastSoldCents / 100) > 125 ? (node.lastSoldCents * 0.79) : (node.lastSoldCents - 2500);
      const payout = node?.lastSoldCents ? `$${(payoutAmount / 100).toFixed(2)}` : 'No data';
  
      tableHTML += `<tr>
                      <td>${size}</td>
                      <td>${lastSoldDate}</td>
                      <td>${lastSoldPrice}</td>
                      <td>${payout}</td>
                    </tr>`;
    });
  
    tableHTML += '</table>';
    document.getElementById('data').innerHTML = productDetailsHTML + tableHTML;
  }
  
  
