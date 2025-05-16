import { FlowDocumentJSON } from './typings';
import { WorkflowNodeType } from './nodes';

export const initialData: FlowDocumentJSON = {
  "nodes": [
    {
      "id": "start_0",
      "type": "start",
      "meta": {
        "position": {
          "x": 24,
          "y": 303
        }
      },
      "data": {
        "title": "Start / 开始",
        "outputs": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "default": ""
            }
          }
        }
      }
    },
    {
      "id": "character_0",
      "type": "character",
      "meta": {
        "position": {
          "x": 400,
          "y": 200
        }
      },
      "data": {
        "title": "Li Guanyi / 李观一",
        "properties": {
          "characterJSON": {
            "personality": {
              "CoreTemperament": {
                "OptimismLevel": {
                  "Value": 60,
                  "Caption": "乐观度"
                },
                "CalmnessLevel": {
                  "Value": 70,
                  "Caption": "冷静度"
                },
                "ExtroversionLevel": {
                  "Value": 30,
                  "Caption": "外向性"
                },
                "SeriousnessLevel": {
                  "Value": 65,
                  "Caption": "严肃性"
                },
                "PatienceLevel": {
                  "Value": 75,
                  "Caption": "耐心度"
                },
                "SensitivityLevel": {
                  "Value": 65,
                  "Caption": "敏感度"
                }
              },
              "InternalValues": {
                "HonestyLevel": {
                  "Value": 70,
                  "Caption": "诚实度"
                },
                "KindnessLevel": {
                  "Value": 75,
                  "Caption": "善良度"
                },
                "JusticeLevel": {
                  "Value": 60,
                  "Caption": "公正性"
                },
                "LoyaltyLevel": {
                  "Value": 90,
                  "Caption": "忠诚度"
                },
                "CourageLevel": {
                  "Value": 80,
                  "Caption": "勇气度"
                },
                "StrengthOfPrinciples": {
                  "Value": 70,
                  "Caption": "原则性强度"
                }
              },
              "ThinkingStyle": {
                "LogicalityLevel": {
                  "Value": 75,
                  "Caption": "逻辑性"
                },
                "AnalyticalLevel": {
                  "Value": 70,
                  "Caption": "分析性"
                },
                "CreativityLevel": {
                  "Value": 60,
                  "Caption": "创造性"
                },
                "FlexibilityLevel": {
                  "Value": 70,
                  "Caption": "灵活性"
                },
                "CuriosityLevel": {
                  "Value": 80,
                  "Caption": "好奇心强度"
                },
                "DepthOfThought": {
                  "Value": 65,
                  "Caption": "思考深度"
                }
              },
              "InternalMotivation": {
                "AmbitionLevel": {
                  "Value": 55,
                  "Caption": "野心度"
                },
                "NeedForAchievementPower": {
                  "Value": 40,
                  "Caption": "成就/权力需求强度"
                },
                "NeedForKnowledgeUnderstanding": {
                  "Value": 85,
                  "Caption": "求知/理解需求强度"
                },
                "NeedForAffiliationBelonging": {
                  "Value": 80,
                  "Caption": "归属/社交需求强度"
                },
                "SelfDisciplineLevel": {
                  "Value": 85,
                  "Caption": "自律性"
                },
                "PerseveranceLevel": {
                  "Value": 90,
                  "Caption": "毅力强度"
                }
              },
              "SelfPerception": {
                "ConfidenceLevel": {
                  "Value": 60,
                  "Caption": "自信度"
                },
                "SelfEsteemLevel": {
                  "Value": 60,
                  "Caption": "自尊水平"
                },
                "HumilityLevel": {
                  "Value": 65,
                  "Caption": "谦逊度"
                },
                "AnxietyLevel": {
                  "Value": 70,
                  "Caption": "焦虑水平"
                },
                "InnerPeaceLevel": {
                  "Value": 35,
                  "Caption": "内在平静度"
                }
              }
            },
            "relationships": [
              {
                "character": "Murong Qiushui / 慕容秋水",
                "type": "Aunt (Guardian) / 婶娘（监护人）",
                "description": "Raised him for 10+ years, critically ill, very close relationship, taught him scholarly arts. / 抚养其十余年，病重，关系非常亲密，教授他琴棋书画等文雅技艺。"
              },
              {
                "character": "Yue Qianfeng / 越千峰",
                "type": "Informal Master/Benefactor / 非正式师父/恩人",
                "description": "Taught him crucial martial arts (Pojun Saber Technique, Pozhen Chant), source of bronze ding activation, a fugitive general. / 传授关键武艺（破军刀法，破阵曲），青铜鼎激活源头，是逃亡将领。"
              },
              {
                "character": "Night Ride Cavalry / 夜驰骑兵",
                "type": "Enemies/Pursuers / 敌人/追杀者",
                "description": "Have been hunting him since infancy, possess distinctive cloud pattern armor, represent a constant threat. / 自婴儿时期便追杀他，拥有独特的云纹铠甲，代表着持续的威胁。"
              },
              {
                "character": "Xue Shuangtao / 薛霜涛",
                "type": "Acquaintance/Employer / 相识/雇主",
                "description": "Met at Liu Family Private School, hired him as a calculation tutor due to his math skills. / 在柳家私塾相识，因其算术能力聘请其为算经家教。"
              },
              {
                "character": "Old Doctor Chen / 陈老大夫",
                "type": "Colleague/Elder Figure / 同事/长辈",
                "description": "Kind elder at Huichun Hall apothecary who showed concern for Li Guanyi. / 回春堂药铺里的和善长者，关心李观一。"
              },
              {
                "character": "Old Shopkeeper of Huichun Hall / 回春堂老掌柜",
                "type": "Former Employer / 前雇主",
                "description": "Pragmatic but kind-hearted shopkeeper who eventually dismissed Li Guanyi but provided a recommendation letter. / 务实但心善的掌柜，最终辞退了李观一但提供了推荐信。"
              }
            ],
            "language": "chinese",
            "name": "Li Guanyi / 李观一",
            "age": 13,
            "background": {
              "origin": "Unknown, Resides in Guanyi City, Chen Guo / 未知，居于陈国关翼城",
              "occupation": "Apothecary Apprentice / 药师学徒",
              "history": "Survived assassination attempt as infant, possesses mysterious bronze ding suppressing poison. Raised by sick aunt Murong Qiushui. Learned martial arts from fugitive general Yue Qianfeng. Seeks survival, cure, and strength while hiding from pursuers (Night Ride Cavalry). / 婴儿时遭遇追杀幸存，身怀神秘青铜鼎压制奇毒。由病重婶娘慕容秋水抚养长大。从逃亡将领越千峰处学得武艺。在躲避追兵（夜驰骑兵）的同时寻求生存、解药与力量。"
            }
          },
          "characterName": "Li Guanyi / 李观一",
          "characterFilePath": "李观一.json",
          "loadError": ""
        },
        "data": {
          "properties": {
            "characterJSON": {
              "personality": {
                "CoreTemperament": {
                  "OptimismLevel": {
                    "Value": 60,
                    "Caption": "乐观度"
                  },
                  "CalmnessLevel": {
                    "Value": 70,
                    "Caption": "冷静度"
                  },
                  "ExtroversionLevel": {
                    "Value": 30,
                    "Caption": "外向性"
                  },
                  "SeriousnessLevel": {
                    "Value": 65,
                    "Caption": "严肃性"
                  },
                  "PatienceLevel": {
                    "Value": 75,
                    "Caption": "耐心度"
                  },
                  "SensitivityLevel": {
                    "Value": 65,
                    "Caption": "敏感度"
                  }
                },
                "InternalValues": {
                  "HonestyLevel": {
                    "Value": 70,
                    "Caption": "诚实度"
                  },
                  "KindnessLevel": {
                    "Value": 75,
                    "Caption": "善良度"
                  },
                  "JusticeLevel": {
                    "Value": 60,
                    "Caption": "公正性"
                  },
                  "LoyaltyLevel": {
                    "Value": 90,
                    "Caption": "忠诚度"
                  },
                  "CourageLevel": {
                    "Value": 80,
                    "Caption": "勇气度"
                  },
                  "StrengthOfPrinciples": {
                    "Value": 70,
                    "Caption": "原则性强度"
                  }
                },
                "ThinkingStyle": {
                  "LogicalityLevel": {
                    "Value": 75,
                    "Caption": "逻辑性"
                  },
                  "AnalyticalLevel": {
                    "Value": 70,
                    "Caption": "分析性"
                  },
                  "CreativityLevel": {
                    "Value": 60,
                    "Caption": "创造性"
                  },
                  "FlexibilityLevel": {
                    "Value": 70,
                    "Caption": "灵活性"
                  },
                  "CuriosityLevel": {
                    "Value": 80,
                    "Caption": "好奇心强度"
                  },
                  "DepthOfThought": {
                    "Value": 65,
                    "Caption": "思考深度"
                  }
                },
                "InternalMotivation": {
                  "AmbitionLevel": {
                    "Value": 55,
                    "Caption": "野心度"
                  },
                  "NeedForAchievementPower": {
                    "Value": 40,
                    "Caption": "成就/权力需求强度"
                  },
                  "NeedForKnowledgeUnderstanding": {
                    "Value": 85,
                    "Caption": "求知/理解需求强度"
                  },
                  "NeedForAffiliationBelonging": {
                    "Value": 80,
                    "Caption": "归属/社交需求强度"
                  },
                  "SelfDisciplineLevel": {
                    "Value": 85,
                    "Caption": "自律性"
                  },
                  "PerseveranceLevel": {
                    "Value": 90,
                    "Caption": "毅力强度"
                  }
                },
                "SelfPerception": {
                  "ConfidenceLevel": {
                    "Value": 60,
                    "Caption": "自信度"
                  },
                  "SelfEsteemLevel": {
                    "Value": 60,
                    "Caption": "自尊水平"
                  },
                  "HumilityLevel": {
                    "Value": 65,
                    "Caption": "谦逊度"
                  },
                  "AnxietyLevel": {
                    "Value": 70,
                    "Caption": "焦虑水平"
                  },
                  "InnerPeaceLevel": {
                    "Value": 35,
                    "Caption": "内在平静度"
                  }
                }
              },
              "relationships": [
                {
                  "character": "Murong Qiushui / 慕容秋水",
                  "type": "Aunt (Guardian) / 婶娘（监护人）",
                  "description": "Raised him for 10+ years, critically ill, very close relationship, taught him scholarly arts. / 抚养其十余年，病重，关系非常亲密，教授他琴棋书画等文雅技艺。"
                },
                {
                  "character": "Yue Qianfeng / 越千峰",
                  "type": "Informal Master/Benefactor / 非正式师父/恩人",
                  "description": "Taught him crucial martial arts (Pojun Saber Technique, Pozhen Chant), source of bronze ding activation, a fugitive general. / 传授关键武艺（破军刀法，破阵曲），青铜鼎激活源头，是逃亡将领。"
                },
                {
                  "character": "Night Ride Cavalry / 夜驰骑兵",
                  "type": "Enemies/Pursuers / 敌人/追杀者",
                  "description": "Have been hunting him since infancy, possess distinctive cloud pattern armor, represent a constant threat. / 自婴儿时期便追杀他，拥有独特的云纹铠甲，代表着持续的威胁。"
                },
                {
                  "character": "Xue Shuangtao / 薛霜涛",
                  "type": "Acquaintance/Employer / 相识/雇主",
                  "description": "Met at Liu Family Private School, hired him as a calculation tutor due to his math skills. / 在柳家私塾相识，因其算术能力聘请其为算经家教。"
                },
                {
                  "character": "Old Doctor Chen / 陈老大夫",
                  "type": "Colleague/Elder Figure / 同事/长辈",
                  "description": "Kind elder at Huichun Hall apothecary who showed concern for Li Guanyi. / 回春堂药铺里的和善长者，关心李观一。"
                },
                {
                  "character": "Old Shopkeeper of Huichun Hall / 回春堂老掌柜",
                  "type": "Former Employer / 前雇主",
                  "description": "Pragmatic but kind-hearted shopkeeper who eventually dismissed Li Guanyi but provided a recommendation letter. / 务实但心善的掌柜，最终辞退了李观一但提供了推荐信。"
                }
              ],
              "language": "chinese",
              "name": "Li Guanyi / 李观一",
              "age": 13,
              "background": {
                "origin": "Unknown, Resides in Guanyi City, Chen Guo / 未知，居于陈国关翼城",
                "occupation": "Apothecary Apprentice / 药师学徒",
                "history": "Survived assassination attempt as infant, possesses mysterious bronze ding suppressing poison. Raised by sick aunt Murong Qiushui. Learned martial arts from fugitive general Yue Qianfeng. Seeks survival, cure, and strength while hiding from pursuers (Night Ride Cavalry). / 婴儿时遭遇追杀幸存，身怀神秘青铜鼎压制奇毒。由病重婶娘慕容秋水抚养长大。从逃亡将领越千峰处学得武艺。在躲避追兵（夜驰骑兵）的同时寻求生存、解药与力量。"
              }
            },
            "characterName": "Li Guanyi / 李观一",
            "characterFilePath": "李观一.json",
            "loadError": ""
          }
        },
        "title": "Li Guanyi / 李观一"
      }
    },
    {
      "id": "json_viewer_0",
      "type": "json_viewer",
      "meta": {
        "position": {
          "x": 417,
          "y": -63
        }
      },
      "data": {
        "title": "JSON Viewer / JSON 查看器",
        "inputs": {
          "type": "object",
          "properties": {
            "jsonDataIn": {
              "type": "object",
              "title": "JSON Data In / JSON数据输入"
            }
          }
        },
        "inputsValues": {},
        "properties": {}
      }
    },
    {
      "id": "end_0",
      "type": "end",
      "meta": {
        "position": {
          "x": 901,
          "y": 3
        }
      },
      "data": {
        "title": "End / 结束",
        "inputs": {
          "type": "object",
          "properties": {
            "result": {
              "type": "string"
            }
          }
        }
      }
    }
  ],
  "edges": [
    {
      "sourceNodeID": "start_0",
      "targetNodeID": "character_0"
    },
    {
      "sourceNodeID": "character_0",
      "targetNodeID": "json_viewer_0",
      "sourcePortID": "characterOut",
      "targetPortID": "jsonDataIn"
    },
    {
      "sourceNodeID": "json_viewer_0",
      "targetNodeID": "end_0"
    }
  ]
};
