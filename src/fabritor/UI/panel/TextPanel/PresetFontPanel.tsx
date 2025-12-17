import { Flex, Card, Divider } from 'antd';
import Title from '@/fabritor/components/Title';
import { Trans, useTranslation, translate } from '@/i18n/utils';

const PRESET_FONT_LIST = [
  {
    label: <div style={{ fontSize: 30, fontFamily: 'SmileySans', fontWeight: 'bold' }}><Trans i18nKey="panel.text.add_title" /></div>,
    key: 'title',
    config: {
      fontFamily: 'SmileySans',
      fontWeight: 'bold',
      fontSize: 120,
      text: () => translate('panel.text.add_title'),
      top: 100
    }
  },
  {
    label: <div style={{ fontSize: 24, fontFamily: 'AlibabaPuHuiTi' }}><Trans i18nKey="panel.text.add_subtitle" /></div>,
    key: 'sub-title',
    config: {
      fontFamily: 'AlibabaPuHuiTi',
      fontWeight: 'bold',
      fontSize: 100,
      text: () => translate('panel.text.add_subtitle'),
      top: 400
    }
  },
  {
    label: <div style={{ fontSize: 16, fontFamily: 'SourceHanSerif' }}><Trans i18nKey="panel.text.add_body_text" /></div>,
    key: 'content',
    config: {
      fontFamily: 'SourceHanSerif',
      fontSize: 80,
      text: () => translate('panel.text.add_body_text'),
    }
  },
  {
    label: <div style={{ fontSize: 26, fontFamily: '霞鹜文楷', color: '#ffffff' , WebkitTextStroke: '1px rgb(255, 87, 87)' }}><Trans i18nKey="panel.text.add_text_border" /></div>,
    key: 'content',
    config: {
      fontFamily: '霞鹜文楷',
      fontSize: 100,
      text: () => translate('panel.text.add_text_border'),
      fill: '#ffffff',
      stroke: '#ff5757',
      strokeWidth: 12
    }
  }
];

// 电商常用预设文字
const ECOMMERCE_PRESET_LIST = [
  {
    label: <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>HOT</div>,
    key: 'hot',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => 'HOT',
      fill: '#ff4d4f'
    }
  },
  {
    label: <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>NEW</div>,
    key: 'new',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => 'NEW',
      fill: '#ff4d4f'
    }
  },
  {
    label: <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>SALE</div>,
    key: 'sale',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => 'SALE',
      fill: '#52c41a'
    }
  },
  {
    label: <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>LIMITED</div>,
    key: 'limited',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 70,
      text: () => 'LIMITED',
      fill: '#fa8c16'
    }
  },
  {
    label: <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>FREE</div>,
    key: 'free',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => 'FREE',
      fill: '#1890ff'
    }
  },
  {
    label: <div style={{ fontSize: 22, fontWeight: 'bold', color: '#ff4d4f' }}>-50%</div>,
    key: 'discount50',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 90,
      text: () => '-50%',
      fill: '#ff4d4f'
    }
  },
  {
    label: <div style={{ fontSize: 22, fontWeight: 'bold', color: '#ff4d4f' }}>-30%</div>,
    key: 'discount30',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 90,
      text: () => '-30%',
      fill: '#ff4d4f'
    }
  },
  {
    label: <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>BEST SELLER</div>,
    key: 'bestseller',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 60,
      text: () => 'BEST SELLER',
      fill: '#722ed1'
    }
  },
  {
    label: <div style={{ fontSize: 22, fontWeight: 'bold', color: '#eb2f96' }}>TOP</div>,
    key: 'top',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => 'TOP',
      fill: '#eb2f96'
    }
  },
  {
    label: <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>⭐⭐⭐⭐⭐</div>,
    key: 'stars',
    config: {
      fontFamily: 'Arial',
      fontSize: 60,
      text: () => '⭐⭐⭐⭐⭐',
      fill: '#faad14'
    }
  },
  {
    label: <div style={{ fontSize: 20, fontWeight: 'bold', color: '#13c2c2' }}>100%</div>,
    key: 'percent100',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => '100%',
      fill: '#13c2c2'
    }
  },
  {
    label: <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f5222d' }}>BUY 1 GET 1</div>,
    key: 'b1g1',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 50,
      text: () => 'BUY 1 GET 1',
      fill: '#f5222d'
    }
  },
  // 货币符号
  {
    label: <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>¥</div>,
    key: 'cny',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 100,
      text: () => '¥',
      fill: '#ff4d4f'
    }
  },
  {
    label: <div style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14' }}>₱</div>,
    key: 'php',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 100,
      text: () => '₱',
      fill: '#faad14'
    }
  },
  {
    label: <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>฿</div>,
    key: 'thb',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 100,
      text: () => '฿',
      fill: '#52c41a'
    }
  },
  {
    label: <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>$</div>,
    key: 'usd',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 100,
      text: () => '$',
      fill: '#1890ff'
    }
  },
  // 带价格的货币预设
  {
    label: <div style={{ fontSize: 22, fontWeight: 'bold', color: '#ff4d4f' }}>¥99</div>,
    key: 'cny99',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => '¥99',
      fill: '#ff4d4f'
    }
  },
  {
    label: <div style={{ fontSize: 22, fontWeight: 'bold', color: '#faad14' }}>₱199</div>,
    key: 'php199',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => '₱199',
      fill: '#faad14'
    }
  },
  {
    label: <div style={{ fontSize: 22, fontWeight: 'bold', color: '#52c41a' }}>฿99</div>,
    key: 'thb99',
    config: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 80,
      text: () => '฿99',
      fill: '#52c41a'
    }
  }
];

export default function PresetFontPanel (props) {
  const { addTextBox } = props;
  const { t } = useTranslation();

  const handleClick = (item) => {
    addTextBox?.(item.config);
  }

  return (
    <Flex vertical gap={8} style={{ marginTop: 16 }}>
      <Title>{t('panel.text.presets')}</Title>
      {
        PRESET_FONT_LIST.map(item => (
          <Card
            key={item.key}
            hoverable
            onClick={() => { handleClick(item) }}
            bodyStyle={{
              padding: '12px 30px'
            }}
          >
            {item.label}
          </Card>
        ))
      }
      
      <Divider style={{ margin: '8px 0' }} />
      <Title>{t('panel.text.ecommerce_presets')}</Title>
      <Flex wrap="wrap" gap={8}>
        {
          ECOMMERCE_PRESET_LIST.map(item => (
            <Card
              key={item.key}
              hoverable
              onClick={() => { handleClick(item) }}
              bodyStyle={{
                padding: '8px 16px',
                textAlign: 'center'
              }}
              style={{ flex: '0 0 calc(50% - 4px)' }}
            >
              {item.label}
            </Card>
          ))
        }
      </Flex>
    </Flex>
  );
}